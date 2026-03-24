import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext()

export const authReducer = (state, action) => { //take in pervious state and action
    switch (action.type) {
        case 'LOGIN':
            return {...state, user: action.payload} //keep authisready and update user after login
        case 'LOGOUT':
            return {...state, user: null} //keep authisready and clear user after logout
        case 'AUTH_READY': 
            return { user: action.payload, authIsReady: true } //set user from local storage and mark auth as ready
        default:
            return state
    }
}
export const AuthContextProvider = ({children}) => {
    const[state, dispatch] = useReducer(authReducer, { //register state using useReducer hook (+get dispatch state back)
        user: null, //not logged in
        authIsReady: false //track when local storage check is complete
    })

    useEffect(() => {  //fire function and empty dependency array (i.e. only fire use effect function once the component (react app) first renders) 
        const user = JSON.parse(localStorage.getItem('user'))  //check for token in storage (just once - upon render) to check if user exists in local storage

        //dispatch AUTH_READY regardless of whether user exists or not
        //this ensures the app knows auth loading is finished
        dispatch({ type: 'AUTH_READY', payload: user })

    }, [])

    console.log('AuthContext state: ', state) //just to keep track of state in console

    return ( //2 curly braces for object, & spread syntax on the state
        <AuthContext.Provider value={{...state, dispatch}}> 
            {children}
        </AuthContext.Provider>
    )
}