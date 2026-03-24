import { useEffect, useState } from "react"
import { authFetch } from "../utils/authFetch"

export const useUpcomingBookings = (user, logout) => {
    const [myUpcoming, setMyUpcoming] = useState([]) //store user's upcoming booked classes

    const fetchMyUpcoming = async () => {
        if (!user) {
            setMyUpcoming([]) //clear upcoming classes if no user logged in
            return
        }

        const response = await authFetch("/api/danceclasses/bookings/me/upcoming", {}, user, logout) // protected route, so use authFetch

        if (!response) {
            return //stop if authFetch logs user out
        }

        const json = await response.json()

        if (!response.ok) {
            return
        }

        // json is a list of bookings with populated classId
        const upcomingClasses = json
            .map((booking) => booking.classId) //extract booked class objects
            .filter((danceClass) => danceClass !== null) //remove nulls from past classes

        setMyUpcoming(upcomingClasses) //update hook state
    }

    useEffect(() => {
        fetchMyUpcoming() //fetch upcoming classes when user changes
    }, [user?.token])

    return { myUpcoming, fetchMyUpcoming } //return state + manual refresh function
}