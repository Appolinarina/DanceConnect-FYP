import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import { useAuthContext } from "../hooks/useAuthContext"

//date fns
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const DanceClassDetails = ({danceclass, onBook, showBook = true}) => {
    const { dispatch } = useDanceClassesContext()
    const {user} = useAuthContext()

    const isOwner =
        user && danceclass.user_id === user._id

    const handleDelete = async () => {
        if (!user) return

        const response = await fetch("/api/danceclasses/" + danceclass._id, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        })

        const json = await response.json()

        if (response.ok) {
            dispatch({ type: "DELETE_DANCECLASS", payload: json })
        } else {
            console.log(json.error)
        }
    }

    // for logged-in user to only see their own created classes and to be able to delete them (old version of handleDelete)
    // DELETE IF NO ERRORS
    const handleClick = async () => {

        if (!user) {
            return
        }

        const response = await fetch('/api/danceclasses/' + danceclass._id, { //append class id to end of endpoint
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        }) 
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


            {/* Conditional Button Logic */}
            
            {/* if the user owns the class - show delete button */}
            {isOwner && (
            <span onClick={handleDelete}>
                Delete
            </span>
            )}

            {/* if not owner, and we want to allow booking - show book button */}
            {!isOwner && showBook && (
            <button
                type="button"
                onClick={() => onBook && onBook(danceclass._id)}>
                    Book Class
            </button>
            )}
        </div>
    )
}

export default DanceClassDetails