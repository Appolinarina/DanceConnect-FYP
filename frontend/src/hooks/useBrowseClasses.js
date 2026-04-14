import { useMemo, useState } from "react"
import { buildApiUrl } from "../utils/api"

export const useBrowseClasses = (user, myUpcoming) => {
    const [allClasses, setAllClasses] = useState([]) //store raw browse classes returned from backend
    const [error, setError] = useState(null) //store browse fetch errors

    // helper function: fetch browse classes from backend (public endpoint)
    // applies filters via query params
    const fetchBrowseClasses = async (filters) => {
        const params = new URLSearchParams()

        //search term (optional keyword search)
        if (filters.search && filters.search.trim() !== "") {
            params.append("search", filters.search.trim())
        }

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

        const url = buildApiUrl(`/api/danceclasses/browse?${params.toString()}`)

        const response = await fetch(url)
        const json = await response.json()

        if (!response.ok) {
            setError(json.error || "Failed to load classes")
            return
        }

        setAllClasses(json) //store backend results before removing own/booked classes locally
        setError(null) //clear previous error if fetch succeeded
    }

    // remove own created classes or already booked classes from the fetched list
    // this runs locally whenever user or myUpcoming changes, so we do not need to refetch from backend
    const classes = useMemo(() => { //useMemo caches result of calculation between re-renders, to avoid re-calculating filter on every render
        let filteredClasses = allClasses

        if (user && user._id) {
            const bookedClassIds = myUpcoming.map((danceclass) => danceclass._id) 
            //get ids of all classes currently in "My Upcoming Classes"

            filteredClasses = allClasses.filter((danceclass) => 
                danceclass.user_id !== user._id && !bookedClassIds.includes(danceclass._id)
                //keep class only if:
                //1. it was not created by current user
                //2. it has not already been booked by current user
            )
        }

        return filteredClasses
    }, [allClasses, user, myUpcoming])

    return { classes, error, setError, fetchBrowseClasses }
}