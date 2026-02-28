import { useEffect, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import DanceClassDetails from "../components/DanceClassDetails"

const Browse = () => {
  const { user } = useAuthContext()

  const [classes, setClasses] = useState([])
  const [myUpcoming, setMyUpcoming] = useState([])
  const [error, setError] = useState(null)

  // Fetch all classes (left side)
  useEffect(() => {
    const fetchAllClasses = async () => {
      const response = await fetch("/api/danceclasses/all", {
        headers: { Authorization: `Bearer ${user.token}` },
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error || "Failed to load classes")
        return
      }

      setClasses(json)
      setError(null)
    }

    if (user) fetchAllClasses()
  }, [user])

  // 2) Fetch my bookings (right side)
  const fetchMyUpcoming = async () => {
    const response = await fetch("/api/danceclasses/bookings/me", {
      headers: { Authorization: `Bearer ${user.token}` },
    })

    const json = await response.json()

    if (!response.ok) {
      return
    }

    // Extract class objects from bookings
    const bookedClasses = json.map((booking) => {
      return booking.classId
    })

    // Keep only future classes
    const futureClasses = bookedClasses.filter((danceClass) => {
      if (!danceClass) return false
      return new Date(danceClass.date) > new Date()
    })

    // Sort by soonest first
    const sortedUpcomingClasses = futureClasses.sort((classA, classB) => {
      return new Date(classA.date) - new Date(classB.date)
    })

    setMyUpcoming(sortedUpcomingClasses)
  }

  useEffect(() => {
    if (user) fetchMyUpcoming()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // 3) Book a class, then refresh "My Upcoming"
  const handleBook = async (classId) => {
    const response = await fetch("/api/danceclasses/" + classId + "/book", {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
    })

    const json = await response.json()

    if (!response.ok) {
      setError(json.error || "Booking failed")
      return
    }

    setError(null)
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

        {myUpcoming.length === 0 && (
          <p>No upcoming bookings yet.</p>
        )}

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