import { post } from '../io'
import { setError } from './error'
import { dumpConfiguration } from './saves'

export const REQUEST_PDF = 'REQUEST_PDF'
export const RECEIVE_PDF = 'RECEIVE_PDF'
export const FAIL_PDF = 'FAIL_PDF'

export const requestPDF = () => {
    return {
        type: REQUEST_PDF
    }
}

export const receivePDF = () => {
    return {
        type: RECEIVE_PDF
    }
}

export const failPDF = () => {
    return {
        type: FAIL_PDF
    }
}

export const createPDF = () => {
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

        dispatch(requestPDF())

        return post('/sst/create-pdf/', data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.blob()
            }
            else {
                throw new Error('Bad status creating PDF: ' + response.status)
            }
        }).then(blob => {
            if (navigator.msSaveBlob !== undefined) {
                navigator.msSaveBlob(blob, 'report.pdf')
            }
            else {
                let reader = new FileReader()
                reader.addEventListener('loadend', e => {
                    let node = document.createElement('a')
                    node.setAttribute('href', e.target.result)
                    node.setAttribute('download', 'report.pdf')
                    document.body.appendChild(node)
                    node.click()
                    document.body.removeChild(node)
                })
                reader.readAsDataURL(blob)
            }

            dispatch(receivePDF())
        }).catch(err => {
            console.log(err)

            dispatch(setError(
                'Error creating PDF', 'Sorry, there was an error creating the PDF report.', JSON.stringify({
                    action: 'createPDF',
                    error: err ? err.message : null,
                    data
                }, null, 2)
            ))
            dispatch(failPDF())
        })
    }
}
