import { post, get } from '../io'
import { setError } from './error'
import { dumpConfiguration } from './saves'
import { reports } from '../config'

export const REQUEST_REPORT = 'REQUEST_REPORT'
export const RECEIVE_REPORT = 'RECEIVE_REPORT'
export const FAIL_REPORT = 'FAIL_REPORT'
export const REQUEST_TIF_JOB = 'REQUEST_TIF_JOB'
export const RECEIVE_TIF_JOB = 'RECEIVE_TIF_JOB'
export const FAIL_TIF_JOB = 'FAIL_TIF_JOB'
export const RECEIVE_TIF_JOB_STATUS = 'RECEIVE_TIF_JOB_STATUS'
export const REQUEST_TIF_JOB_STATUS = 'REQUEST_TIF_JOB_STATUS'

export const requestReport = name => {
    return {
        type: REQUEST_REPORT,
        name: name
    }
}

export const receiveReport = () => {
    return {
        type: RECEIVE_REPORT
    }
}

export const failReport = () => {
    return {
        type: FAIL_REPORT
    }
}

export const createReport = name => {
    return (dispatch, getState) => {
        let { lastRun, job, map } = getState()
        let { basemap, zoom, opacity } = map

        let resultsLayer = '/tiles/' + job.serviceId + '/{z}/{x}/{y}.png'

        let data = {
            configuration: dumpConfiguration(lastRun),
            tile_layers: [basemap, resultsLayer],
            zoom,
            opacity
        }

        dispatch(requestReport(name))
        const reportUrl = reports.find(r => r.name === name).url

        // Safari workaround
        let supportsDownloadAttr = "download" in document.createElement("a")
        if (!supportsDownloadAttr && navigator.msSaveBlob === undefined) {
            let form = document.createElement('form')
            form.method = 'POST'
            form.action = reportUrl

            for (let key in data) {
                let input = document.createElement('input')
                input.type = 'hidden'
                input.name = key
                input.value = JSON.stringify(data[key])

                form.appendChild(input)
            }

            form.submit()

            // We don't know when the report is complete in this so wait a few seconds and dispatch the receive event
            setTimeout(() => dispatch(receiveReport()), 5000)

            return
        }

        return post(reportUrl, data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.blob()
            }
            else {
                throw new Error('Bad status creating report: ' + response.status)
            }
        }).then(blob => {
            const filename = 'report.' + getState().report.name
            if (navigator.msSaveBlob !== undefined) {
                navigator.msSaveBlob(blob, filename)
            }
            else {
                let reader = new FileReader()
                reader.addEventListener('loadend', e => {
                    let node = document.createElement('a')
                    node.setAttribute('href', e.target.result)
                    node.setAttribute('download', filename)
                    document.body.appendChild(node)
                    node.click()
                    document.body.removeChild(node)
                })
                reader.readAsDataURL(blob)
            }

            dispatch(receiveReport())
        }).catch(err => {
            console.log(err)

            dispatch(setError(
                'Error creating report', 'Sorry, there was an error creating the report.', JSON.stringify({
                    action: 'createReport',
                    error: err ? err.message : null,
                    data
                }, null, 2)
            ))
            dispatch(failReport())
        })
    }
}

export const requestTIFJob = () => {
    return {
        type: REQUEST_TIF_JOB
    }
}

export const receiveTIFJob = ({ uuid }) => {
    return {
        type: RECEIVE_TIF_JOB,
        uuid
    }
}

export const failTIFJob = () => {
    return {
        type: FAIL_TIF_JOB
    }
}

export const createTIFJob = () => {
    return (dispatch, getState) => {
        dispatch(requestReport('tif'))
        dispatch(requestTIFJob())

        let inputs = {
            service_id: getState().job.serviceId
        }
        let data = {
            job: 'write_tif',
            inputs: JSON.stringify(inputs)
        }

        return post('/geoprocessing/rest/jobs/', data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status creating job: ' + response.status)
            }
        }).then(json => dispatch(receiveTIFJob(json))).catch(err => {
            console.log(err)

            dispatch(failTIFJob())
            dispatch(failReport())
            dispatch(setError(
                'Export error', 'Sorry, there was an error creating the GeoTIFF dataset.', JSON.stringify({
                    action: 'createTIFJob',
                    error: err ? err.message : null,
                    inputs
                }, null, 2)
            ))
        })
    }
}

export const receiveTIFJobStatus = json => {
    return {
        type: RECEIVE_TIF_JOB_STATUS,
        status: json.status
    }
}

export const requestTIFJobStatus = () => {
    return {
        type: REQUEST_TIF_JOB_STATUS
    }
}

export const fetchTIFJobStatus = jobId => {
    return dispatch => {
        let url = '/geoprocessing/rest/jobs/' + jobId + '/'

        dispatch(requestTIFJobStatus())

        return get(url).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status polling job: ' + response.status)
            }
        }).then(json => {
            if (json.status === 'failure') {
                dispatch(failTIFJob())
                dispatch(failReport())
                dispatch(setError(
                    'Export error', 'Sorry, there was an error creating the GeoTIFF dataset.', JSON.stringify({
                        action: 'fetchTIFJobStatus',
                        response: json,
                        jobId
                    }, null, 2)
                ))

                return
            }
            else if (json.status === 'success') {
                dispatch(receiveReport())
                let { filename } = JSON.parse(json.outputs)
                window.location = '/downloads/' + filename
            }

            dispatch(receiveTIFJobStatus(json))
        }).catch(err => {
            console.log(err)

            dispatch(failTIFJob())
            dispatch(failReport())
            dispatch(setError('Export error', 'Sorry, there was a problem getting the job status.'))
        })
    }
}
