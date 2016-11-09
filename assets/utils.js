import { regions } from './config'

/* A shortcut for Object.assign({}, obj, props) */
export const morph = (obj, props = {}) => Object.assign({}, obj, props)

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

export const findClosestRegion = (lon, lat) => {
    let distance = (point) => {
        return Math.sqrt(Math.pow(lon - point[0], 2) + Math.pow(lat - point[1], 2))
    }

    let sortedRegions = regions.sort((a, b) => distance(a.center) - distance(b.center))
    let match = sortedRegions.find(region => {
        let bounds = region.bounds

        return lon > bounds[0] && lon < bounds[2] && lat > bounds[1] && lat < bounds[3]
    })

    return match !== undefined ? match : sortedRegions[0]
}
