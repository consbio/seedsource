import React, { PropTypes } from 'react'
import RegionButton from '../containers/RegionButton'
import { regions } from '../config'

const RegionChooser = ({ region, regionMethod, validRegions, onThumb }) => {

    // temp image source, set regions[idx].src with thumbnail info
    let placeholdersrc = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjwhLS0KU291cmNlIFVSTDogaG9sZGVyLmpzLzEwMCV4MTgwCkNyZWF0ZWQgd2l0aCBIb2xkZXIuanMgMi42LjAuCkxlYXJuIG1vcmUgYXQgaHR0cDovL2hvbGRlcmpzLmNvbQooYykgMjAxMi0yMDE1IEl2YW4gTWFsb3BpbnNreSAtIGh0dHA6Ly9pbXNreS5jbwotLT48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWyNob2xkZXJfMTVhMWY4NzQ3ODIgdGV4dCB7IGZpbGw6I0FBQUFBQTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMHB0IH0gXV0+PC9zdHlsZT48L2RlZnM+PGcgaWQ9ImhvbGRlcl8xNWExZjg3NDc4MiI+PHJlY3Qgd2lkdGg9IjE3MSIgaGVpZ2h0PSIxODAiIGZpbGw9IiNFRUVFRUUiLz48Zz48dGV4dCB4PSI2MSIgeT0iOTQuNSI+MTcxeDE4MDwvdGV4dD48L2c+PC9nPjwvc3ZnPg=="

    return (
        <div>
            <div>
                <div className="btn-group-sm btn-group">
                    <RegionButton name="auto">Automatic</RegionButton>
                    <RegionButton name="custom">Custom</RegionButton>
                </div>
            </div>
            <div className="row">
                {regions.map(r => (
                    <div className="col-xs-3 col-md-3" key={r.name}>
                        <a href="#" className={ "thumbnail " + (r.name === region ? "active" : "")}>
                            <img
                                src={placeholdersrc}
                                value={r.name}
                                onClick={e => {
                                    e.preventDefault()
                                    onThumb(r.name)
                                }}
                            />
                        </a>
                        {r.label}
                    </div>
                ))}
            </div>
        </div>
    )
}

RegionChooser.propTypes = {
    region: PropTypes.string.isRequired,
    regionMethod: PropTypes.string.isRequired,
    validRegions: PropTypes.array.isRequired
}

export default RegionChooser
