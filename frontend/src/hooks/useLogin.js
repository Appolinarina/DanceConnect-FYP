import {useState} from "react";
import {useAuthContext} from './useAuthContext' //for user property and dispatch function

// signup, get response back
// if successful (user logged in) - update auth context to say we have current user (update line 17 in AuthContext.js)

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null) //track loading state (if async req is in progress or not) - disable form button while req incomplete
    const {dispatch} = useAuthContext()

    const login = async(email, password) => {
        //starting request
        setIsLoading(true)
        setError(null)

        const response = await fetch('/api/user/login',  { // / proxy to localhost port 4000
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({email, password})
        })
        const json = await response.json()

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }
        if (response.ok) {
            // save user to local storage (in application tab in inspect element)
            localStorage.setItem('user', JSON.stringify(json))

            //update auth context
            dispatch({type: 'LOGIN', payload: json})

            setIsLoading(false)
        }
    }
    return {login, isLoading, error}
}