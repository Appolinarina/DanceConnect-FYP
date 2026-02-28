import { useEffect, useState, useCallback } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import DanceClassDetails from "../components/DanceClassDetails"

const Browse = () => {
  const { user } = useAuthContext()

  const [classes, setClasses] = useState([])
  const [myUpcoming, setMyUpcoming] = useState([])
  const [error, setError] = useState(null)

  // Fetch all classes for browsing (left side)
  useEffect(() => {
    const fetchAllClasses = async () => {
      if (!user) {
        return
      }

      const response = await fetch("/api/danceclasses/browse", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || "Failed to load classes")
        return
      }

      setClasses(json)
      setError(null)
    }

    fetchAllClasses()
  }, [user])

  
  // fetch upcoming bookings (right column) - backend already filters out past classes
  const fetchMyUpcoming = useCallback(async () => {
    if (!user) {
      return
    }

    const response = await fetch("/api/danceclasses/bookings/me/upcoming", {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })

    const json = await response.json()

    if (!response.ok) {
      return
    }

    // json is a list of bookings with classId populated
    const upcomingClasses = json
      .map((booking) => booking.classId)
      .filter((danceClass) => danceClass !== null)

    setMyUpcoming(upcomingClasses)
  }, [user])

  useEffect(() => {
    fetchMyUpcoming()
  }, [fetchMyUpcoming])


  // book a class, then refresh upcoming list
  const handleBook = async (classId) => {
    if (!user) {
      return
    }

    const response = await fetch("/api/danceclasses/" + classId + "/book", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })

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

        {classes.map((danceclass) => (
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

        {myUpcoming.length === 0 && <p>No upcoming bookings yet.</p>}

        {myUpcoming.map((danceclass) => (
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