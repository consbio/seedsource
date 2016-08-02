import fetch from 'isomorphic-fetch'
import { getCookies } from '../utils'

export const requestPDF = () => {
    return {
        type: 'REQUEST_PDF'
    }
}

export const receivePDF = () => {
    return {
        type: 'RECEIVE_PDF'
    }
}

export const createPDF = () => {
    return (dispatch, getState) => {
        let { lastRun, job, map } = getState()
        let { basemap, zoom } = map

        let resultsLayer = '/tiles/' + job.serviceId + '/{z}/{x}/{y}.png'

        let data = {
            configuration: lastRun,
            tile_layers: [basemap, resultsLayer],
            zoom
        }

        dispatch(requestPDF())

        return fetch('/sst/create-pdf/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookies().csrftoken
            },
            body: JSON.stringify(data)
        }).then(response => {
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
            alert('Sorry, there was an error creating the PDF.')

            dispatch(receivePDF())
        })
    }
}
