import TabHeader from '../containers/TabHeader'
import TabContent from '../containers/TabContent'
import RunConfiguration from '../containers/RunConfiguration'

export default () => (
    <div className="sidebar">
        <ul className="nav nav-tabs">
            <TabHeader name="configuration">Configuration</TabHeader>
            <TabHeader name="saves">Saved Runs</TabHeader>
        </ul>
        <TabContent name="configuration">
            <RunConfiguration />
        </TabContent>
        <TabContent name="saves">
            <span>Saved runs</span>
        </TabContent>
    </div>
)
