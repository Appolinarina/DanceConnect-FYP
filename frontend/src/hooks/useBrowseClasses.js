import { useState } from "react"

export const useBrowseClasses = (user, myUpcoming) => {
    const [classes, setClasses] = useState([]) //store browse classes
    const [error, setError] = useState(null) //store browse fetch errors

    // helper function: fetch browse classes from backend (public endpoint)
    // applies filters via query params and removes own/booked classes
    const fetchBrowseClasses = async (filters) => {
        const params = new URLSearchParams()

        // level filter (optional filter)
        if (filters.level) {
            params.append("level", filters.level)
        }

        // free only filter
        if (filters.freeOnly) {
            params.append("freeOnly", "true")
        } 
        else {
            // min/max price only apply if freeOnly is not selected
            if (filters.minPrice !== "") {
                params.append("minPrice", filters.minPrice)
            }

            if (filters.maxPrice !== "") {
                params.append("maxPrice", filters.maxPrice)
            }
        }

        // sort option
        if (filters.sort) {
            params.append("sort", filters.sort)
        }

        const url = `/api/danceclasses/browse?${params.toString()}`

        const response = await fetch(url)
        const json = await response.json()

        if (!response.ok) {
            setError(json.error || "Failed to load classes")
            return
        }

        // do not show your own created classes or classes already booked by current user
        let filteredClasses = json

        if (user && user._id) {
            const bookedClassIds = myUpcoming.map((danceclass) => danceclass._id) 
            //get ids of all classes currently in "My Upcoming Classes"

            filteredClasses = json.filter((danceclass) => 
                danceclass.user_id !== user._id && !bookedClassIds.includes(danceclass._id)
                //keep class only if:
                //1. it was not created by current user
                //2. it has not already been booked by current user
            )
        }

        setClasses(filteredClasses) //update browse classes shown on page
        setError(null) //clear previous error if fetch succeeded
    }

    return { classes, error, setError, fetchBrowseClasses }
}