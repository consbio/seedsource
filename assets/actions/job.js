import fetch from 'isomorphic-fetch'
import { getCookies } from '../utils'

export const RECEIVE_JOB = 'RECEIVE_JOB'
export const FAIL_JOB = 'FAIL_JOB'
export const REQUEST_JOB = 'REQUEST_JOB'
export const RECEIVE_JOB_STATUS = 'RECEIVE_JOB_STATUS'
export const REQUEST_JOB_STATUS = 'REQUEST_JOB_STATUS'
export const FINISH_JOB = 'FINISH_JOB'

export const receiveJob = (configuration, json) => {
    return {
        type: RECEIVE_JOB,
        jobId: json.uuid
    }
}

export const failJob = () => {
    return {
        type: FAIL_JOB
    }
}

export const requestJob = configuration => {
    return {
        type: REQUEST_JOB,
        configuration
    }
}

export const createJob = configuration => {
    return dispatch => {
        let { variables, objective, climate } = configuration

        let inputs = {
            variables: variables.map(item => {
                /* Run the tool against the seedlot climate when looking for seedlots, otherwise run against the
                 * planting site climate.
                 */
                let selectedClimate = objective === 'seedlots' ? climate.seedlot : climate.site
                let year = selectedClimate.time

                if (year !== '1961_1990' && year !== '1981_2010') {
                    year = selectedClimate.model + '_' +selectedClimate.time
                }

                return 'service://west1_' + year + 'Y_' + item.name + ':' + item.name
            }),
            limits: variables.map(item => {
                return {min: item.value - item.transfer, max: item.value + item.transfer}
            })
        }

        let url = '/geoprocessing/rest/jobs/'
        let data = {
            job: 'generate_scores',
            inputs: JSON.stringify(inputs)
        }

        dispatch(requestJob(configuration))

        return fetch(url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookies().csrftoken
            },
            body: JSON.stringify(data)
        }).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status creating job: ' + response.status)
            }

            return response.json()
        }).then(json => dispatch(receiveJob(configuration, json))).catch(err => {
            console.log(err)
            dispatch(failJob())
            alert('Sorry, there was an error creating the job.')
        })
    }
}

export const receiveJobStatus = json => {
    return {
        type: RECEIVE_JOB_STATUS,
        status: json.status,
        serviceId: json.status === 'success' ? JSON.parse(json.outputs).raster_out : null
    }
}

export const requestJobStatus = () => {
    return {
        type: REQUEST_JOB_STATUS
    }
}

export const fetchJobStatus = jobId => {
    return dispatch => {
        let url = '/geoprocessing/rest/jobs/' + jobId + '/'
    
        dispatch(requestJobStatus())

        return fetch(url, {credentials: 'same-origin'}).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status polling job: ' + response.status)
            }

            return response.json()
        }).then(json => {
            if (json.status === 'failure') {
                alert('Score calculation failed.')
            }

            dispatch(receiveJobStatus(json))
        }).catch(err => {
            console.log(err)
            dispatch(failJob())
            alert('Sorry, there was an error getting the job status.')
        })
    }
}

export const finishJob = configuration => {
    return {
        type: FINISH_JOB,
        configuration
    }
}
