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
  const [showUpcomingClasses, setShowUpcomingClasses] = useState(false) //mobile only toggle for upcoming classes

  //search bar UI state
  const [searchTerm, setSearchTerm] = useState("")

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

  //stores the last search term the user actually applied
  //this is kept separate from the text box so pressing Enter only applies search
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")

  // true if both price fields have values and min is bigger than max
  const priceRangeError =
    minPrice !== "" &&
    maxPrice !== "" &&
    Number(minPrice) > Number(maxPrice)

  //usebookings hook - booking and unbooking classes
  const { handleBook, handleUnbook } = useBookings(
    user,
    logout,
    fetchMyUpcoming,
    fetchBrowseClasses,
    appliedFilters,
    appliedSearchTerm,
    setError
  )

  // fetch browse classes (left column) using current filters
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
        search: "",
      })
    }

    fetchInitialBrowseClasses()
    // only refetch from backend when auth becomes ready
    // booked classes are now removed locally inside useBrowseClasses when myUpcoming changes
  }, [authIsReady]) // dependency array: rerun when auth becomes ready

  //search handler (applies only the keyword search, not open filter changes)
  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim()

    //save current search term as the last applied search
    setAppliedSearchTerm(trimmedSearch)

    //fetch using last applied filters + current search term
    fetchBrowseClasses({
      ...appliedFilters,
      search: trimmedSearch,
    })
  }

  //apply search when pressing Enter in search box
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch()
    }
  }

  // apply filters button handler (calls backend with current filter state)
  const handleApplyFilters = () => {
    // stop if price range is invalid
    if (priceRangeError) {
      return
    }

    // save the user's current filter inputs as the "last applied filters"
    const newAppliedFilters = {
      level: levelFilter,
      freeOnly: freeOnly,
      minPrice: minPrice,
      maxPrice: maxPrice,
      sort: sortBy,
    }

    setAppliedFilters(newAppliedFilters)

    //apply filters together with whatever is currently in the search bar
    const trimmedSearch = searchTerm.trim()
    setAppliedSearchTerm(trimmedSearch)

    fetchBrowseClasses({
      ...newAppliedFilters,
      search: trimmedSearch,
    })
  }

  //clear only the expandable panel filters and keep the search bar as it is
  const handleClearFilters = () => {
    //reset filter ui state back to default browse page state
    setLevelFilter("")
    setFreeOnly(false)
    setMinPrice("")
    setMaxPrice("")
    setSortBy("date_asc")

    const clearedFilters = {
      level: "",
      freeOnly: false,
      minPrice: "",
      maxPrice: "",
      sort: "date_asc",
    }

    //save cleared filters as the new applied filters
    setAppliedFilters(clearedFilters)

    //refetch classes with cleared filters but keep the already applied search term
    fetchBrowseClasses({
      ...clearedFilters,
      search: appliedSearchTerm,
    })
  }

  // mobile dropdown button text for upcoming classes
  const upcomingButtonText = showUpcomingClasses
    ? "Hide Upcoming Classes" //if upcoming section is open, button should hide it
    : user
      ? `My Upcoming Classes (${myUpcoming.length})` //if user is logged in, show booking count
      : "My Upcoming Classes" //if no user, show button text without count

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

          {/* mobile only upcoming classes toggle */}
          <div className="mobile-upcoming-classes">
            <div className="mobile-upcoming-highlight">
              <p className="mobile-upcoming-kicker">Already booked a class?</p>
              <p className="mobile-upcoming-text">
                View the classes you have coming up.
              </p>

              <button
                type="button"
                className="mobile-upcoming-toggle"
                onClick={() => setShowUpcomingClasses(!showUpcomingClasses)}
              >
                {upcomingButtonText}
              </button>
            </div>

            {showUpcomingClasses && (
              <div className="mobile-upcoming-panel">
                {!user && (
                  <div className="empty-state">
                    Please log in to view your upcoming classes.
                  </div>
                )}

                {user && myUpcoming.length === 0 && (
                  <div className="empty-state">No classes booked so far</div>
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
            )}
          </div>

          {error && <div className="error">{error}</div>}

          {/* Browse Filters Component */}
          <BrowseFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            handleSearchKeyDown={handleSearchKeyDown}
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
            handleClearFilters={handleClearFilters}
            priceRangeError={priceRangeError}
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
      <div className="sidebar-panel browse-upcoming-sidebar">
        <div className="browse-upcoming-header">
          <h3>My Upcoming Classes</h3>
        </div>

        <div className="browse-upcoming-list">
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
    </div>
  )
}

export default Browse