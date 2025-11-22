import { useState } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"

const DanceClassForm = () => {
    const {dispatch} = useDanceClassesContext()
    //create None state for all properties for the form for user to type into
    const [title, setTitle] = useState('') 
    const [dance_style, setDanceStyle] = useState('') 
    const [dance_level, setDanceLevel] = useState('') 
    const [location, setLocation] = useState('') 
    const [date, setDate] = useState('') 
    const [capacity, setCapacity] = useState('') 
    const [price, setPrice] = useState('') 

    const [error, setError] = useState(null) 


    const handleSubmit = async (e) => {
        e.preventDefault() //prevents the default form submission upon refresh

        const danceclass = {title, dance_style, dance_level, location, date, capacity, price}

        const response = await fetch('/api/danceclasses', {
            method: 'POST',
            body: JSON.stringify(danceclass), //changes danceclass to JSON string, and sends as body
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const json = await response.json() //response coming in from danceClassController json response

        if (!response.ok) {
            
            setError(json.error)
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
            console.log('New Dance Class Created', json)
            dispatch({type: 'CREATE_DANCECLASSES', payload: json}) //dispatch only if response is ok, to update context state, so to re-render the home component
        }
    }

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Create New Dance Class</h3>

            <label>Class Title:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value)} //fires function when user types into field, (e) takes in event object, target is the input field
                value={title} //opposite-way data binding, if the title value gets changed from outside the form (i.e. upon form reset, changes back to None)
            />

            <label>Dance Style:</label>
            <input
                type="text"
                onChange={(e) => setDanceStyle(e.target.value)} 
                value={dance_style} 
            />

            <label>Class Level:</label>
            <input
                type="text"
                onChange={(e) => setDanceLevel(e.target.value)} 
                value={dance_level} 
            />

            <label>Location:</label>
            <input
                type="text"
                onChange={(e) => setLocation(e.target.value)} 
                value={location} 
            />

            <label>Date:</label>
            <input
                type="date"
                onChange={(e) => setDate(e.target.value)} 
                value={date} 
            />
            
            <label>Capacity:</label>
            <input
                type="number"
                onChange={(e) => setCapacity(e.target.value)} 
                value={capacity} 
            />

            <label>Price:</label>
            <input
                type="number"
                step="0.01" //increment/decrement by 0.01 (i.e. to have 2 d.p.)
                onChange={(e) => setPrice(e.target.value)} 
                onBlur={() => { 
                    if (price !== "") setPrice(parseFloat(price).toFixed(2)); //onBlur 2 d.p. format shows up after user clicks away
                }}
                value={price}
            /> 
            <button>Create Class</button>
            {error && <div className="error">{error}</div>} 
        </form> //if error, output error for user to see
    )
}

export default DanceClassForm