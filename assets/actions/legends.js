import fetch from 'isomorphic-fetch'
import { getServiceName } from '../utils'

export const receiveVariableLegend = json => {
    return {
        type: 'RECEIVE_VARIABLE_LEGEND',
        legend: json.layers[0].legend
    }
}

export const requestVariableLegend = () => {
    return {
        type: 'REQUEST_VARIABLE_LEGEND'
    }
}

export const fetchVariableLegend = () => {
    return (dispatch, getState) => {
        let { runConfiguration, activeVariable, legends } = getState()
        let { objective, time, model } = runConfiguration

        dispatch(requestVariableLegend())

        if (activeVariable !== null && legends.variable.legend === null && !legends.variable.isFetching) {
            let url = '/arcgis/rest/services/' + getServiceName(activeVariable, objective, time, model) +
                '/MapServer/legend'

            return fetch(url, {credentials: 'same-origin'})
                .then(response => response.json())
                .then(json => dispatch(receiveVariableLegend(json)))
        }

        return Promise.resolve()
    }
}

export const receiveResultsLegend = json => {
    return {
        type: 'RECEIVE_RESULTS_LEGEND',
        legend: json.layers[0].legend.map(element => {
            switch (element.label) {
                case '0':
                    element.label = 'High'
                    break

                case '100':
                    element.label = 'Low'
                    break
            }

            return element
        })
    }
}

export const requestResultsLegend = () => {
    return {
        type: 'REQUEST_RESULTS_LEGEND'
    }
}

export const fetchResultsLegend = () => {
    return (dispatch, getState) => {
        let { job, legends } = getState()

        if (job.serviceId !== null && legends.results.legend === null && !legends.results.isFetching) {
            dispatch(requestResultsLegend())

            let url = '/arcgis/rest/services/' + job.serviceId + '/MapServer/legend'

            return fetch(url, {credentials: 'same-origin'})
                .then(response => response.json())
                .then(json => dispatch(receiveResultsLegend(json)))
        }

        return Promise.resolve()
    }
}
