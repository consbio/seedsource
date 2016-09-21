import React from 'react'

export default () => (
    <div>
        <h4>Planting Healthy Forests</h4>
        <img src="/static/sst/images/hands.jpg" className="aboutImage" />
        <p>
            The Seedlot Selection Tool (SST) is a GIS mapping program designed to help forest managers match seedlots
            with planting sites based on climatic information. The climates of the planting sites can be chosen to
            represent current climates, or future climates based on selected climate change scenarios.
        </p>
        <div>&nbsp;</div>
        <div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_objective.gif" />
                <h4>1. Select Objective</h4>
                <p>
                    You can find seedlots for your planting site or planting sites for your seedlot
                </p>
            </div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_location.gif" />
                <h4>2. Select Location</h4>
                <p>
                    You can click on the map or enter coordinates to locate your seedlot or planting site
                </p>
            </div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_climate.gif" />
                <h4>3. Select Climate Scenarios</h4>
                <p>
                    You can select historical, current, or future climates for your seedlots of planting sites
                </p>
            </div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_method.gif" />
                <h4>4. Select Transfer Limit Method</h4>
                <p>
                    You can enter your own custom limit or use an existing zone to calculate a transfer limit
                </p>
            </div>
            <div className="aboutStep subStep">
                <img src="/static/sst/images/about_species.gif" />
                <h4>Select Species</h4>
                <p>
                    You can use species-specific or generic zones and transfer limits
                </p>
            </div>
            <div className="aboutStep subStep">
                <img src="/static/sst/images/about_zone.gif" />
                <h4>Select Zone</h4>
                <p>
                    If you use the zone method, you can select among the available zones for your location
                </p>
            </div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_variables.gif" />
                <h4>5. Select Climate Variables</h4>
                <p>
                    You can use a variety of climate variables to match your seedlot and planting site
                </p>
            </div>
            <div className="aboutStep">
                <img src="/static/sst/images/about_map.gif" />
                <h4>6. Map your Results</h4>
                <p>
                    The map shows where to find appropriate seedlots or planting sites
                </p>
            </div>
        </div>

        <div>&nbsp;</div>
    </div>
)
