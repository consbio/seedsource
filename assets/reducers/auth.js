export default (state, action) => {
    switch (action.type) {
        case 'LOGIN':
            return true
        
        case 'LOGOUT':
        default:
            return false
    }
}
