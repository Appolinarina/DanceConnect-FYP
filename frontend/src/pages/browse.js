import { useEffect, useState } from "react"
import { useAuthContext } from "../hooks/useAuthContext"
import DanceClassDetails from "../components/DanceClassDetails"

const Browse = () => {
  const { user } = useAuthContext()
  const [classes, setClasses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllClasses = async () => {
      const response = await fetch("/api/danceclasses/all", {
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

    if (user) fetchAllClasses()
  }, [user])

  const handleBook = async (classId) => {
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
    console.log("Booked:", json)
  }

  return (
    <div className="browse">
      <h2>Browse Classes</h2>
      {error && <div className="error">{error}</div>}

      <div className="danceclasses">
        {classes.map((danceclass) => (
          <DanceClassDetails
            key={danceclass._id}
            danceclass={danceclass}
            onBook={handleBook}
          />
        ))}
      </div>
      <div></div>
    </div>
  )
}

export default Browse