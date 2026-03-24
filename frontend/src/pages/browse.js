import { useEffect, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import DanceClassDetails from "../components/DanceClassDetails"
import BrowseFilters from "../components/BrowseFilters"
import { useUpcomingBookings } from "../hooks/useUpcomingBookings"
import { useBookings } from "../hooks/useBookings"
import { useBrowseClasses } from "../hooks/useBrowseClasses"

const Browse = () => {
  const { user, authIsReady } = useAuthContext() //get user + check if auth has finished loading
  const { logout } = useLogout()
  const { myUpcoming, fetchMyUpcoming } = useUpcomingBookings(user, logout) //custom hook for upcoming bookings
  const { classes, error, setError, fetchBrowseClasses } = useBrowseClasses(user, myUpcoming) //custom hook for browse class fetching + filtering

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

  //usebookings hook - booking and unbooking classes
  const { handleBook, handleUnbook } = useBookings(
    user,
    logout,
    fetchMyUpcoming,
    fetchBrowseClasses,
    appliedFilters,
    setError
  )

  // fetch all classes - left side (public endpoint)
  // runs once on page load with default filters
  useEffect(() => {

    //wait until auth has been checked (prevent all existing classes showing on browse page)
    if (!authIsReady) {
        return
    }

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
  }, [authIsReady, myUpcoming]) // dependency array: re-run when auth becomes ready or bookings change

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

  return (
    <div className="home">
      {/* LEFT COLUMN */}
      <div className="danceclasses">
        <div className="hero-panel">
          <p className="hero-kicker">Find your next class</p>
          <h1>Discover dance classes near you</h1>
          <p className="hero-text">
            Explore styles, levels, and prices to find the class that suits you
            best.
          </p>
        </div>

        <div className="page-panel">
          <h2 className="section-title">Browse Classes</h2>
          <p className="section-subtitle">
            Search available classes and refine the results using filters.
          </p>

          {error && <div className="error">{error}</div>}

          {/* Browse Filters Component */}
          <BrowseFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            freeOnly={freeOnly}
            setFreeOnly={setFreeOnly}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            handleApplyFilters={handleApplyFilters}
          />

          {classes.length === 0 && (
            <div className="empty-state">
              No classes available to book just yet.
            </div>
          )}

          {classes.length > 0 &&
            classes.map((danceclass) => (
              <DanceClassDetails
                key={danceclass._id}
                danceclass={danceclass}
                onBook={handleBook}
              />
            ))}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="sidebar-panel">
        <h3>My Upcoming Classes</h3>

        {!user && (
          <div className="empty-state">
            Please log in to view your upcoming classes.
          </div>
        )}

        {user && myUpcoming.length === 0 && (
          <div className="empty-state">No upcoming bookings yet.</div>
        )}

         {user &&
          myUpcoming.map((danceclass) => (
            <DanceClassDetails
              key={danceclass._id}
              danceclass={danceclass}
              showBook={false}
              showUnbook={true}
              onUnbook={handleUnbook}
            />
          ))}
      </div>
    </div>
  )
}

export default Browse