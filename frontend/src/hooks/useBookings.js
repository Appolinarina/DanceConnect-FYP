import { useNavigate } from "react-router-dom"
import { authFetch } from "../utils/authFetch"
import { useToast } from "../hooks/useToast"

export const useBookings = (user, logout, fetchMyUpcoming, fetchBrowseClasses, appliedFilters, appliedSearchTerm, setError) => {
    const navigate = useNavigate()
    const { showToast } = useToast()

    // handle booking a class
    const handleBook = async (classId) => {
        // redirect to login if not authenticated
        if (!user) {
            showToast("Login to book a class")
            navigate("/login", {
                state: {
                    redirectAfterLogin: {
                        type: "book-class", //remember what action user was trying to do
                        classId //store class id so we can book it after login
                    }
                }
            })
            return
        }

        const response = await authFetch("/api/danceclasses/" + classId + "/book", { method: "POST" }, user, logout)

        if (!response) {
            return //user logged out automatically
        }

        const json = await response.json()

        if (!response.ok) {
            setError(json.error || "Booking failed")
            return
        }

        setError(null)
        showToast("Class booked")

        // refresh upcoming bookings (right column)
        await fetchMyUpcoming()

        // refresh browse list (left column)
        //keep the currently applied filters + search term after booking
        await fetchBrowseClasses({
            ...appliedFilters, //spread all properties from appliedFilters into new object
            search: appliedSearchTerm, //apply keyword search
        })
    }

    // handle unbooking a class
    const handleUnbook = async (classId) => {
        if (!user) {
            navigate("/login")
            return
        }

        const response = await authFetch("/api/danceclasses/" + classId + "/book", { method: "DELETE" }, user, logout)

        if (!response) {
            return
        }

        const json = await response.json()

        if (!response.ok) {
            setError(json.error || "Unbooking failed")
            return
        }

        setError(null)
        showToast("Class unbooked")

        // refresh upcoming bookings
        await fetchMyUpcoming()

        // refresh browse list
        //keep the currently applied filters + search term after unbooking
        await fetchBrowseClasses({
            ...appliedFilters,
            search: appliedSearchTerm,
        })
    }

    return { handleBook, handleUnbook }
}