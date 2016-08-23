export const RECEIVE_VARIABLE_LEGEND = 'RECEIVE_VARIABLE_LEGEND'
export const REQUEST_VARIABLE_LEGEND = 'REQUEST_VARIABLE_LEGEND'
export const RECEIVE_RESULTS_LEGEND = 'RECEIVE_RESULTS_LEGEND'
export const REQUEST_RESULTS_LEGEND = 'REQUEST_RESULTS_LEGEND'

export const receiveVariableLegend = json => {
    return {
        type: RECEIVE_VARIABLE_LEGEND,
        legend: json.layers[0].legend
    }
}

export const requestVariableLegend = () => {
    return {
        type: REQUEST_VARIABLE_LEGEND
    }
}

export const receiveResultsLegend = json => {
    return {
        type: RECEIVE_RESULTS_LEGEND,
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
        type: REQUEST_RESULTS_LEGEND
    }
}
