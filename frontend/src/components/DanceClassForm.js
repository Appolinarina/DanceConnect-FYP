import { useState } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { useToast } from "../hooks/useToast"
import { authFetch } from "../utils/authFetch"

const DanceClassForm = ({ onSuccess }) => {
    const { dispatch } = useDanceClassesContext()
    const { user } = useAuthContext()
    const { logout } = useLogout()
    const { showToast } = useToast()

    //create None state for all properties for the form for user to type into
    const [title, setTitle] = useState('')
    const [dance_style, setDanceStyle] = useState('')
    const [dance_level, setDanceLevel] = useState('')
    const [location, setLocation] = useState('')
    const [date, setDate] = useState('')
    const [capacity, setCapacity] = useState('')
    const [price, setPrice] = useState('')

    const [error, setError] = useState(null)
    const [emptyFields, setEmptyFields] = useState([]) //state for empty fields
    const [invalidFields, setInvalidFields] = useState([]) //state for invalid fields

    const handleSubmit = async (e) => {
        e.preventDefault() //prevents the default form submission upon refresh

        if (!user) {
            setError('You must be logged in')
            return
        }

        const danceclass = { title, dance_style, dance_level, location, date, capacity, price }

        const response = await authFetch("/api/danceclasses", {
            method: 'POST',
            body: JSON.stringify(danceclass), //changes danceclass to JSON string, and sends as body
            headers: {
                'Content-Type': 'application/json'
            }
        }, user, logout)

        if (!response) {
            return //stop if authFetch logs user out
        }

        const json = await response.json() //response coming in from danceClassController json response

        if (!response.ok) {
            setError(json.error)
            setEmptyFields(json.emptyFields || [])
            setInvalidFields(json.invalidFields || []) //use invalidFields here, not emptyFields
        }

        if (response.ok) {
            // reset form, for next form creation
            setTitle('')
            setDanceStyle('')
            setDanceLevel('')
            setLocation('')
            setDate('')
            setCapacity('')
            setPrice('')
            setError(null)
            setEmptyFields([])
            setInvalidFields([])
            console.log('New Dance Class Created', json)
            dispatch({ type: 'CREATE_DANCECLASS', payload: json }) //dispatch only if response is ok, to update context state
            showToast("Your class has been created") //show popup

            if (onSuccess) {
                onSuccess() //close mobile form after successful class creation
            }
        }
    }

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Create New Dance Class</h3>
            <p className="field-help">Please fill in all fields below to create a class</p>

            <label>Class Title:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value)} //fires function when user types into field
                value={title}
                className={emptyFields.includes('title') ? 'error' : ''}
            />

            <label>Dance Style:</label>
            <input
                type="text"
                onChange={(e) => setDanceStyle(e.target.value)}
                value={dance_style}
                className={emptyFields.includes('dance_style') ? 'error' : ''}
            />

            <label>Class Level:</label>
            <select
                onChange={(e) => setDanceLevel(e.target.value)}
                value={dance_level}
                className={emptyFields.includes('dance_level') ? 'error' : ''}
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
                className={emptyFields.includes('location') ? 'error' : ''}
            />

            <label>Date and Time:</label>
            <input
                type="datetime-local"
                onChange={(e) => setDate(e.target.value)}
                value={date}
                className={emptyFields.includes('date') || invalidFields.includes('date') ? 'error' : ''}
            />
            <p className="field-help">Click the calendar icon to select the date and time.</p>

            <label>Capacity:</label>
            <input
                type="number"
                min="0"
                onChange={(e) => setCapacity(e.target.value)}
                value={capacity}
                className={emptyFields.includes('capacity') || invalidFields.includes('capacity') ? 'error' : ''}
            />

            <label>Price:</label>
            <div className="currency-input-wrapper">
                <span className="currency-symbol">€</span>
                <input
                    type="number"
                    min="0"
                    step="0.01" //increment/decrement by 0.01 (i.e. to have 2 d.p.)
                    onChange={(e) => setPrice(e.target.value)}
                    onBlur={() => {
                        if (price === "") return
                        const n = Number(price)
                        if (!Number.isNaN(n)) setPrice(n.toFixed(2)) //onBlur 2 d.p. format shows up after user clicks away
                    }}
                    value={price}
                    className={emptyFields.includes('price') || invalidFields.includes("price") ? 'error' : ''}
                />
            </div>

            <button>Create Class</button>
            {error && <div className="error">{error}</div>}
        </form>
    ) //if error, output error for user to see
}

export default DanceClassForm