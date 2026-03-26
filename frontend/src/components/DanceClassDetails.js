import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import { useAuthContext } from "../hooks/useAuthContext"
import { Link } from "react-router-dom"

//date fns
import format from 'date-fns/format'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const DanceClassDetails = ({
    danceclass,
    onBook,
    onUnbook,
    showBook = true,
    showUnbook = false
}) => {
    const { dispatch } = useDanceClassesContext()
    const {user} = useAuthContext()

    // if logged in user is class owner
    const isOwner = user && danceclass.user_id && danceclass.user_id.toString() === user._id.toString() //check if user exists, then if class exists, then compare the 2 with user id

    // spaces left stored on the class document (decreases when users book)
    const spotsRemaining = danceclass.spotsRemaining

    const handleDelete = async () => {
        if (!user) {
            return
        }

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

    return (
        <div className="danceclass-details">
            <h4>{danceclass.title}</h4>
            <p><strong>Style: </strong>{danceclass.dance_style}</p>
            <p><strong>Level: </strong>{danceclass.dance_level}</p>
            <p><strong>Location: </strong>{danceclass.location}</p>
            <p><strong>Date: </strong> {format(new Date(danceclass.date), " dd MMM yyyy")}</p>
            <p><strong>Time: </strong> {format(new Date(danceclass.date), " HH:mm")}</p>
            <p><strong>Capacity: </strong>{danceclass.capacity}</p>
            <p><strong>Spaces left: </strong>{spotsRemaining}</p>
            <p><strong>Price: </strong>{danceclass.price}</p>

            <p>{formatDistanceToNow(new Date(danceclass.createdAt), {addSuffix: true})} </p>

            {/* if the user owns the class - show edit/delete buttons */}
            {isOwner && (
                <div className="class-owner-actions">
                    <Link to={`/classes/${danceclass._id}/edit`} className="owner-action-btn">
                        Edit Class
                    </Link>
                    <span className="owner-action-btn" onClick={handleDelete}>
                        Delete Class
                    </span>
                </div>
            )}

            {/* if not owner, and booking is allowed - show book button */}
            {!isOwner && showBook && (
                <button
                    type="button"
                    disabled={spotsRemaining <= 0}
                    onClick={() => onBook && onBook(danceclass._id)}
                >
                    {spotsRemaining <= 0 ? "Full" : "Book Class"}
                </button>
            )}

            {/* if this card is in upcoming bookings - show unbook button */}
            {!isOwner && showUnbook && (
                <button
                    type="button"
                    className="unbook-btn"
                    onClick={() => onUnbook && onUnbook(danceclass._id)}
                >
                    Unbook Class
                </button>
            )}
        </div>
    )
}

export default DanceClassDetails