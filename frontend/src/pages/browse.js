import { useEffect, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { useNavigate } from "react-router-dom"
import DanceClassDetails from "../components/DanceClassDetails"
import { authFetch } from "../utils/authFetch"

const Browse = () => {
  const { user } = useAuthContext()
  const { logout } = useLogout()
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [myUpcoming, setMyUpcoming] = useState([])
  const [error, setError] = useState(null)

  // Filter UI state (with Apply button)
  const [showFilters, setShowFilters] = useState(false)

  const [levelFilter, setLevelFilter] = useState("")
  const [freeOnly, setFreeOnly] = useState(false)

  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const [sortBy, setSortBy] = useState("date_asc")

  // stores the last filters the user actually applied
  // this is what we use when we want to refresh the list for consistency
  const [appliedFilters, setAppliedFilters] = useState({
    level: "",
    freeOnly: false,
    minPrice: "",
    maxPrice: "",
    sort: "date_asc",
  })

  // helper function: fetch browse classes (public endpoint)
  // backend handles filtering/sorting via query params
  const fetchBrowseClasses = async (filters) => {
    const params = new URLSearchParams()

    // level filter (optional filter)
    if (filters.level) {
      params.append("level", filters.level)
    }

    // free only filter
    if (filters.freeOnly) {
      params.append("freeOnly", "true")
    } else {
      // min/max price only apply if not freeOnly
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

    // do not show your created classes on browse page
    let filteredClasses = json

    if (user && user._id) {
      filteredClasses = json.filter((danceclass) => danceclass.user_id !== user._id)
    }

    setClasses(filteredClasses)
    setError(null)
  }

  // fetch all classes - left side (public endpoint)
  // runs once on page load with default filters
  useEffect(() => {
    const fetchInitialBrowseClasses = async () => {
      await fetchBrowseClasses({
        level: "",
        freeOnly: false,
        minPrice: "",
        maxPrice: "",
        sort: "date_asc",
      })
    }

    fetchInitialBrowseClasses()
    // dependency array is empty because this is initial load only
  }, [])

  // apply filters button handler (calls backend with current filter state)
  const handleApplyFilters = () => {
    // save the user's current filter inputs as the "last applied filters"
    const newAppliedFilters = {
      level: levelFilter,
      freeOnly: freeOnly,
      minPrice: minPrice,
      maxPrice: maxPrice,
      sort: sortBy,
    }

    setAppliedFilters(newAppliedFilters)
    fetchBrowseClasses(newAppliedFilters)
  }

  // fetch my bookings - right side (requires login)
  // this endpoint is protected, so have to use authFetch
  const fetchMyUpcoming = async () => {
    if (!user) {
      return
    }

    const response = await authFetch(
      "/api/danceclasses/bookings/me/upcoming",
      {},
      user,
      logout
    ) // auth header is passed in authFetch.js

    // if token expired, authFetch logs the user out and returns null
    if (!response) {
      return
    }

    const json = await response.json()

    if (!response.ok) {
      return
    }

    // json is a list of bookings with classId populated
    const upcomingClasses = json
      .map((booking) => booking.classId)
      .filter((danceClass) => danceClass !== null)

    setMyUpcoming(upcomingClasses)
  }

  // run fetchMyUpcoming when the user logs in or changes
  useEffect(() => {
    fetchMyUpcoming()
  }, [user?.token])

  // book a class, then refresh "My Upcoming"
  const handleBook = async (classId) => {
    // if not logged in, redirect to login
    if (!user) {
      navigate("/login")
      return
    }

    const response = await authFetch(
      "/api/danceclasses/" + classId + "/book",
      { method: "POST" },
      user,
      logout
    )

    // if token expired, authFetch logs the user out and returns null
    if (!response) {
      return
    }

    const json = await response.json()

    if (!response.ok) {
      setError(json.error || "Booking failed")
      return
    }

    setError(null)

    // refresh right column so newly booked class appears
    await fetchMyUpcoming()

    // refresh left column using LAST APPLIED filters only (consistent behaviour)
    await fetchBrowseClasses(appliedFilters)
  }

  return (
    <div className="home">
      {/* LEFT COLUMN */}
      <div className="danceclasses">
        <h2>Browse Classes</h2>
        {error && <div className="error">{error}</div>}

        {/* Filter toggle button */}
        <button type="button" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filter panel */}
        {showFilters && (
          <div className="filter-panel">
            {/* Row 1: Level + Sort */}
            <div className="filter-row two-col">
              <div className="filter-field">
                <label>Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="">Any level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="open">Open level</option>
                </select>
              </div>

              <div className="filter-field">
                <label>Sort by</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="date_asc">Soonest date</option>
                  <option value="price_asc">Price: lowest first</option>
                  <option value="price_desc">Price: highest first</option>
                </select>
              </div>
            </div>

            {/* Row 2: Free only */}
            {/* Row 2: Free + Min + Max on one line */}
            <div className="filter-row three-col">
              <label className="filter-checkbox">
                Free only
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setFreeOnly(checked)

                    // if user selects "Free only", clear min/max to avoid stale values
                    if (checked) {
                      setMinPrice("")
                      setMaxPrice("")
                    }
                  }}
                />
              </label>

              <div className="filter-field">
                <label>Min Price</label>
                <input
                  type="number"
                  value={minPrice}
                  disabled={freeOnly}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label>Max Price</label>
                <input
                  type="number"
                  value={maxPrice}
                  disabled={freeOnly}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Row 4: Apply */}
            <div className="filter-row">
              <button type="button" onClick={handleApplyFilters}>
                Apply
              </button>
            </div>
          </div>
        )}

        {classes.length === 0 && <p>No classes available to book just yet!</p>}

        {classes.length > 0 &&
          classes.map((danceclass) => (
            <DanceClassDetails
              key={danceclass._id}
              danceclass={danceclass}
              onBook={handleBook}
            />
          ))}
      </div>

      {/* RIGHT COLUMN */}
      <div>
        <h3>My Upcoming Classes</h3>

        {!user && <p>Please log in to view your upcoming classes.</p>}

        {user && myUpcoming.length === 0 && <p>No upcoming bookings yet.</p>}

        {user &&
          myUpcoming.map((danceclass) => (
            <DanceClassDetails
              key={danceclass._id}
              danceclass={danceclass}
              showBook={false}
            />
          ))}
      </div>
    </div>
  )
}

export default Browse