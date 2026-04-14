import { useState } from "react";
import { useAuthContext } from './useAuthContext'
import { useToast } from "./useToast"
import { buildApiUrl } from "../utils/api"

// login, get response back
// if successful (user logged in) - update auth context to say we have current user

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null) //track loading state (if async req is in progress or not) - disable form button while req incomplete
    const { dispatch } = useAuthContext()
    const { showToast } = useToast()

    const login = async (email, password) => {
        //starting request
        setIsLoading(true)
        setError(null)

        const response = await fetch(buildApiUrl('/api/user/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const json = await response.json()

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        }

        if (response.ok) {
            // save user to local storage (in application tab in inspect element)
            localStorage.setItem('user', JSON.stringify(json))

            // update auth context
            dispatch({ type: 'LOGIN', payload: json })

            // show popup
            showToast("You have successfully logged in")

            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}