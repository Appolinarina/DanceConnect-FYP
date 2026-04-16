import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"
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
    const navigate = useNavigate()
    const location = useLocation()

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

            // check if user was redirected to login while trying to book a class
            const pendingAction = location.state?.redirectAfterLogin

            if (pendingAction?.type === "book-class" && pendingAction.classId) {
                // user originally tried to book while logged out
                // now that they are logged in, complete that booking automatically
                const bookResponse = await fetch(buildApiUrl(`/api/danceclasses/${pendingAction.classId}/book`), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${json.token}` //use fresh login token for protected route
                    }
                })

                const bookJson = await bookResponse.json()

                if (bookResponse.ok) {
                    showToast("Class booked") //booking succeeded after login
                } else {
                    showToast(bookJson.error || "Booking failed") //show backend booking error if it fails
                }

                // send user back to browse page after login flow finishes
                navigate("/", { replace: true })
            } else {
                // normal login flow (no pending booking action)
                showToast("You are now logged in")
                navigate("/", { replace: true })
            }

            setIsLoading(false)
        }
    }

    return { login, isLoading, error }
}