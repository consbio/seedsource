export const getServiceName = (variable, objective, climate) => {
    let serviceName = 'west2_'

    // Show site climate when looking for seedlots, and seedlot climate when looking for sites
    let selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
    let { time, model } = selectedClimate

    if (time === '1961_1990' || time === '1981_2010') {
        serviceName += time
    }
    else {
        serviceName += model + '_' + time
    }

    return serviceName + 'Y_' + variable
}

export const getCookies = () => {
    let cookies = {}

    document.cookie.split(';').forEach(item => {
        let [name, value] = item.trim().split('=')
        cookies[name] = decodeURIComponent(value)
    })

    return cookies
}

/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)
