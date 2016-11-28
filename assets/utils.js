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
    if (lon === null || lat === null) {
        return regions[0]
    }

    let toMercator = point => {
        let r = 6378137.0  // Earth radius
        let x =  r * (point[0] * (Math.PI / 180))
        let y = r * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * (point[1] * (Math.PI / 180)))))

        return [x, y]
    }

    let point = toMercator([lon, lat])

    let distance = p => {
        return Math.sqrt(Math.pow(point[0] - p[0], 2) + Math.pow(point[1] - p[1], 2))
    }

    let sortedRegions = regions.sort((a, b) => distance(toMercator(a.center)) - distance(toMercator(b.center)))
    let match = sortedRegions.find(region => {
        let bounds = region.bounds

        return lon > bounds[0] && lon < bounds[2] && lat > bounds[1] && lat < bounds[3]
    })

    return match !== undefined ? match : sortedRegions[0]
}
