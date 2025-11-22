import { createContext, useReducer } from "react";

export const DanceClassContext = createContext()

export const danceclassReducer = (state, action) => { //previous state (reliable state value), action is object passed into dispatch function
    // to keep local states in sync w/ database w/ dispatch (this doesn't interact w DB!)
    switch(action.type) {
        case 'SET_DANCECLASSES':
            return { //return danceclass property inside the object
                danceclasses: action.payload // payload property (that is passed into dispath func.) is array of all danceclasses, & updates line 24 from null to whatever payload on the action is (array of classes from server)
            }
        case 'CREATE_DANCECLASS':
            return { // single new danceclass object
                danceclasses: [action.payload, ...state.danceclasses] // take existing classes, then spread all states (array of pre-existing class objects), with add new class to top
            }
        case 'DELETE_DANCECLASS':
            return { //filter through all classes, True if we want it to remain, False to take it out of new array
                danceclasses: state.danceclasses.filter((danceclass) => danceclass._id !== action.payload._id) //if class isn't in deleted payload, keep it
            }
        default:
            return state
    }
}

// provide context to application component tree so components can access it & destructure children property
export const DanceClassesContextProvider = ( {children} ) => { // children property represents components/template that the context provider wraps (i.e. the App component in index.js)
    const [state, dispatch] = useReducer(danceclassReducer, { // dispatch function updates danceclassReducer() state, & object in line below
        danceclasses: null //initial state value (for danceclass property)
    })

    // template to wrap application parts that need access to context (the whole application tree needs access)
    return <DanceClassContext.Provider value={{...state, dispatch}}> 
        { children } 
    </DanceClassContext.Provider>
}