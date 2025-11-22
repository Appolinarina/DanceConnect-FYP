import { useDanceClassesContext } from "../hooks/useDanceClassContext"

//date fns
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const DanceClassDetails = ({danceclass}) => {
    const { dispatch } = useDanceClassesContext()

    const handleClick = async () => {
        const response = await fetch('api/danceclasses/' + danceclass._id, {method: 'DELETE'}) //append class id to end of endpoint
        const json = await response.json() //deleted document in json

        if (response.ok) {
            dispatch({type: 'DELETE_DANCECLASS', payload: json})
        }
    }

    return (
        <div className="danceclass-details">
            <h4>{danceclass.title}</h4>
            <p><strong>Style: </strong>{danceclass.dance_style}</p>
            <p><strong>Level: </strong>{danceclass.dance_level}</p>
            <p><strong>Location: </strong>{danceclass.location}</p>
            <p>
                <strong>Date:</strong> 
                {format(new Date(danceclass.date), " dd MMM yyyy")}
            </p>
            <p>
                <strong>Time:</strong> 
                {format(new Date(danceclass.date), " HH:mm")}
            </p>
            <p><strong>Capacity: </strong>{danceclass.capacity}</p>
            <p><strong>Price: </strong>{danceclass.price}</p>
            <p>{formatDistanceToNow(new Date(danceclass.createdAt), {addSuffix: true})} </p> 
            <span onClick={handleClick}>Delete</span>
        </div>
    )
}

export default DanceClassDetails