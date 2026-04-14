import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { authFetch } from "../utils/authFetch"

const EditClass = () => {
    const { id } = useParams() // get class id from URL
    const navigate = useNavigate() // used to redirect after saving
    const { user } = useAuthContext() // get logged in user
    const { logout } = useLogout()

    // form state (pre-filled with existing class data)
    const [title, setTitle] = useState("")
    const [dance_style, setDanceStyle] = useState("")
    const [dance_level, setDanceLevel] = useState("")
    const [location, setLocation] = useState("")
    const [date, setDate] = useState("")
    const [capacity, setCapacity] = useState("")
    const [price, setPrice] = useState("")

    const [error, setError] = useState(null) // error handling
    const [emptyFields, setEmptyFields] = useState([]) // state for empty fields
    const [invalidFields, setInvalidFields] = useState([]) // state for invalid fields
    const [isLoading, setIsLoading] = useState(true) // loading state while fetching class

    // fetch class data when page loads
    useEffect(() => {
        const fetchClass = async () => {
            const response = await authFetch(`/api/danceclasses/${id}`, {}, user, logout)

            if (!response) {
                return
            }

            const json = await response.json()

            if (response.ok) {
                // populate form fields with existing data
                setTitle(json.title || "")
                setDanceStyle(json.dance_style || "")
                setDanceLevel(json.dance_level || "")
                setLocation(json.location || "")
                setCapacity(json.capacity ?? "") // ?? to allow values of 0
                setPrice(json.price ?? "")

                // convert date into format compatible with datetime-local input
                if (json.date) {
                    const localDate = new Date(json.date)
                    const offset = localDate.getTimezoneOffset()
                    const adjustedDate = new Date(localDate.getTime() - offset * 60000)
                    setDate(adjustedDate.toISOString().slice(0, 16))
                }
            } else {
                setError(json.error)
            }

            setIsLoading(false)
        }

        if (user) {
            fetchClass()
        }
    }, [id, user, logout])

    // handle form submission (update class)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const updatedClass = {
            title,
            dance_style,
            dance_level,
            location,
            date,
            capacity,
            price
        }

        const response = await authFetch(`/api/danceclasses/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedClass)
        }, user, logout)

        if (!response) {
            return
        }

        const json = await response.json()

        if (!response.ok) {
            setError(json.error)
            setEmptyFields(json.emptyFields || [])
            setInvalidFields(json.invalidFields || [])
        }

        if (response.ok) {
            setError(null)
            setEmptyFields([])
            setInvalidFields([])
            navigate("/my-classes")
        }
    }

    // leave edit page without saving
    const handleDiscardChanges = () => {
        navigate("/my-classes")
    }

    if (isLoading) {
        return <div className="page-panel">Loading...</div>
    }

    return (
        <div className="page-panel">
            <h2 className="section-title">Edit Class</h2>
            <p className="section-subtitle">
                Update the details of your class below.
            </p>

            <form className="create" onSubmit={handleSubmit}>
                <label>Class title:</label>
                <input
                    type="text"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                    className={emptyFields.includes("title") ? "error" : ""}
                />

                <label>Dance style:</label>
                <input
                    type="text"
                    onChange={(e) => setDanceStyle(e.target.value)}
                    value={dance_style}
                    className={emptyFields.includes("dance_style") ? "error" : ""}
                />

                <label>Dance level:</label>
                <select
                    onChange={(e) => setDanceLevel(e.target.value)}
                    value={dance_level}
                    className={emptyFields.includes("dance_level") ? "error" : ""}
                >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Open">Open level</option>
                </select>

                <label>Location:</label>
                <input
                    type="text"
                    onChange={(e) => setLocation(e.target.value)}
                    value={location}
                    className={emptyFields.includes("location") ? "error" : ""}
                />

                <label>Date and time:</label>
                <input
                    type="datetime-local"
                    onChange={(e) => setDate(e.target.value)}
                    value={date}
                    className={emptyFields.includes("date") ? "error" : ""}
                />

                <label>Capacity:</label>
                <input
                    type="number"
                    min="0"
                    onChange={(e) => setCapacity(e.target.value)}
                    value={capacity}
                    className={emptyFields.includes("capacity") || invalidFields.includes("capacity") ? "error" : ""}
                />

                <label>Price:</label>
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(e) => setPrice(e.target.value)}
                    onBlur={() => {
                        if (price === "") return
                        const n = Number(price)
                        if (!Number.isNaN(n)) setPrice(n.toFixed(2))
                    }}
                    value={price}
                    className={emptyFields.includes("price") || invalidFields.includes("price") ? "error" : ""}
                />

                <div className="form-actions">
                    <button type="submit" className="primary-btn">
                        Save Changes
                    </button>

                    <button
                        type="button"
                        className="secondary-btn"
                        onClick={handleDiscardChanges}
                    >
                        Exit and discard changes
                    </button>
                </div>

                {error && <div className="error">{error}</div>}
            </form>
        </div>
    )
}

export default EditClass