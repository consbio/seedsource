import TabHeader from '../containers/TabHeader'
import TabContent from '../containers/TabContent'
import RunConfiguration from '../containers/RunConfiguration'
import MapConnector from '../containers/MapConnector'
import SavedRuns from '../containers/SavedRuns'

export default () => (
    <div className="sidebar">
        <MapConnector />
        
        <ul className="nav nav-tabs">
            <TabHeader name="configuration">Configuration</TabHeader>
            <TabHeader name="saves">Saved Runs</TabHeader>
        </ul>
        <TabContent name="configuration">
            <RunConfiguration />
        </TabContent>
        <TabContent name="saves">
            <SavedRuns />
        </TabContent>
    </div>
)
