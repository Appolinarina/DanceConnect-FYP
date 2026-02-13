import { createContext, useReducer, useEffect } from "react";

export const AuthContext = createContext()

export const authReducer = (state, action) => { //take in pervious state and action
    switch (action.type) {
        case 'LOGIN':
            return {user: action.payload}
        case 'LOGOUT':
            return {user: null}
        default:
            return state
    }
}
export const AuthContextProvider = ({children}) => {
    const[state, dispatch] = useReducer(authReducer, { //register state using useReducer hook (+get dispatch state back)
        user: null //not logged in
    })

    useEffect(() => {  //fire function and empty dependency array (i.e. only fire use effect function once the component (react app) first renders)
        const user = JSON.parse(localStorage.getItem('user'))  //check for token in storage (just once - upon render)

        if (user) { //dispatch login action if user found in local storage
            dispatch({type: 'LOGIN', payload: user})
        }
    }, [])

    console.log('AuthContext state: ', state) //just to keep track of state in console

    return ( //2 curly braces for object, & spread syntax on the state
        <AuthContext.Provider value={{...state, dispatch}}> 
            {children}
        </AuthContext.Provider>
    )
}