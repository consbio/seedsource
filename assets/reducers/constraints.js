import { ADD_CONSTRAINT, REMOVE_CONSTRAINT, UPDATE_CONSTRAINT_VALUES } from '../actions/constraints'
import { morph } from '../utils'
import { constraints } from '../config'

export default (state = [], action) => {
    switch (action.type) {
        case ADD_CONSTRAINT:
            return [...state, {type: action.constraint, values: constraints[action.constraint]}]

        case REMOVE_CONSTRAINT:
            return state.filter((constraint, i) => i !== action.index)

        case UPDATE_CONSTRAINT_VALUES:
            return state.map((constraint, i) =>
                i === action.index ? morph(constraint, {values: morph(constraint.values, action.values)}) : constraint
            )

        default:
            return state
    }
}
