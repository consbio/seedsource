import resync from '../resync'
import { fetchTIFJobStatus } from '../actions/report'

const reportSelect = ({ report }) => {
    let { TIFJobId, TIFJobIsFetching } = report

    return {jobId: TIFJobId, isFetching: TIFJobIsFetching}
}

export default store => {
    resync(store, reportSelect, (state, io, dispatch, previousState) => {
        let { jobId, isFetching } = state

        if (jobId !== null && previousState.isFetching && !isFetching) {
            setTimeout(() => dispatch(fetchTIFJobStatus(jobId)), 1000)
        }
    })
}
