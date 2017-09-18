import { executeGPTask } from '../io'
import { setError } from './error'
import { constraints as constraintsConfig } from '../config'

export const START_JOB = 'START_JOB'
export const FAIL_JOB = 'FAIL_JOB'
export const RECEIVE_JOB_STATUS = 'RECEIVE_JOB_STATUS'
export const FINISH_JOB = 'FINISH_JOB'

export const startJob = configuration => {
    return {
        type: START_JOB,
        configuration
    }
}

export const failJob = () => {
    return {
        type: FAIL_JOB
    }
}

export const receiveJobStatus = json => {
    return {
        type: RECEIVE_JOB_STATUS,
        status: json.status,
        serviceId: json.status === 'success' ? JSON.parse(json.outputs).raster_out : null
    }
}

export const finishJob = configuration => {
    return {
        type: FINISH_JOB,
        configuration
    }
}

export const runJob = configuration => {
   return dispatch => {
       let { variables, objective, climate, region, constraints, point } = configuration

        let inputs = {
            variables: variables.map(item => {
                /* Run the tool against the seedlot climate when looking for seedlots, otherwise run against the
                 * planting site climate.
                 */
                let selectedClimate = objective === 'seedlots' ? climate.seedlot : climate.site
                let year = selectedClimate.time

                if (year !== '1961_1990' && year !== '1981_2010') {
                    year = selectedClimate.model + '_' + selectedClimate.time
                }

                return 'service://' + region + '_' + year + 'Y_' + item.name + ':' + item.name
            }),
            limits: variables.map(item => {
                return {min: item.value - item.transfer, max: item.value + item.transfer}
            }),
            constraints: constraints.map(({ type, values }) => {
                return {name: type, args: constraintsConfig[type].serialize(configuration, values)}
            }),
            region
        }

       dispatch(startJob(configuration))

       return executeGPTask('generate_scores', inputs, json => dispatch(receiveJobStatus(json))).then(() => {
           dispatch(finishJob(configuration))
       }).catch(err => {
           console.log(err)

           let data = {action: 'runJob'}
           if (err.json !== undefined) {
               data.response = json
           }

           dispatch(failJob())
           dispatch(setError('Processing error', 'Sorry, processing failed.', JSON.stringify(data, null, 2)))
       })
   }
}
