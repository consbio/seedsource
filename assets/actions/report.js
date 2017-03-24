import { post } from '../io'
import { setError } from './error'
import { dumpConfiguration } from './saves'
import { reports } from '../config'

export const REQUEST_REPORT = 'REQUEST_REPORT'
export const RECEIVE_REPORT = 'RECEIVE_REPORT'
export const FAIL_REPORT = 'FAIL_REPORT'

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
        console.log(name)
        console.log(reports)
        const reportObj = reports.find(r => r.name === name)
        console.log(reportObj)
        // Safari workaround
        let supportsDownloadAttr = "download" in document.createElement("a")
        if (!supportsDownloadAttr) {
            let form = document.createElement('form')
            form.method = 'POST'
            form.action = reportObj.reportUrl

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

        return post(reportObj.reportUrl, data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.blob()
            }
            else {
                throw new Error('Bad status creating report: ' + response.status)
            }
        }).then(blob => {
            const reportObj = reports.find(r => r.name == getState().report.name)
            const filename = 'report.' + reportObj.name
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
