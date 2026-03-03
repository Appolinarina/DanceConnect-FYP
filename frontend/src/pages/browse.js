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

  // fetch all classes - left side
  useEffect(() => {
    const fetchAllClasses = async () => {
      // public endpoint - allow browsing even when not logged in
      const response = await fetch("/api/danceclasses/browse")
      const json = await response.json()

      if (!response.ok) {
        setError(json.error || "Failed to load classes")
        return
      }

      setClasses(json)
      setError(null)
    }

    fetchAllClasses()
  }, [])

  // fetch my bookings - right side

  // outside useEffect so we can call it from:
  // 1. useEffect (when user logs in / changes)
  // 2. handleBook (after user books a class)
  const fetchMyUpcoming = async () => {
    if (!user) {
      return
    }

    const response = await authFetch("/api/danceclasses/bookings/me/upcoming", {}, user, logout) // auth header is passed in authFetch.js

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
  }, [user?.token]) // if user exists, pass token. if no user, just return undefined

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

    // If token expired, authFetch logs the user out and returns null
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
  }

  return (
    <div className="home">
      {/* LEFT COLUMN */}
      <div className="danceclasses">
        <h2>Browse Classes</h2>
        {error && <div className="error">{error}</div>}

        {classes.length === 0 && <p>No classes available to book just yet!</p>}

        {classes.length > 0 && classes.map((danceclass) => (
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