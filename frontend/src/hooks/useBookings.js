import { useNavigate } from "react-router-dom"
import { authFetch } from "../utils/authFetch"

export const useBookings = (user, logout, fetchMyUpcoming, fetchBrowseClasses, appliedFilters, setError) => {
    const navigate = useNavigate()

    // handle booking a class
    const handleBook = async (classId) => {
        // redirect to login if not authenticated
        if (!user) {
            navigate("/login")
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

        // refresh upcoming bookings (right column)
        await fetchMyUpcoming()

        // refresh browse list (left column)
        await fetchBrowseClasses(appliedFilters)
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

        // refresh upcoming bookings
        await fetchMyUpcoming()

        // refresh browse list
        await fetchBrowseClasses(appliedFilters)
    }

    return { handleBook, handleUnbook }
}