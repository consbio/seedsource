import { post, executeGPTask } from '../io'
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

export const runTIFJob = () => {
    return (dispatch, getState) => {
        dispatch(requestReport('tif'))

        let inputs = {
            service_id: getState().job.serviceId
        }

        return executeGPTask('write_tif', inputs).then(json => {
            dispatch(receiveReport())
            let { filename } = JSON.parse(json.outputs)
            window.location = '/downloads/' + filename
        }).catch(err => {
            console.log(err)

            let data = {action: 'runTIFJob'}
            if (err.json !== undefined) {
               data.response = json
            }

            dispatch(failReport())
            dispatch(setError('Processing error', 'Sorry, processing failed.', JSON.stringify(data, null, 2)))
        })
    }
}
