import { useState } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { useToast } from "../hooks/useToast"
import { authFetch } from "../utils/authFetch"
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
    const { user } = useAuthContext()
    const { logout } = useLogout()
    const { showToast } = useToast()
    const [showDeleteModal, setShowDeleteModal] = useState(false) //delete confirmation modal
    const [showUnbookModal, setShowUnbookModal] = useState(false) //unbook confirmation modal

    // if logged in user is class owner
    const isOwner = user && danceclass.user_id && danceclass.user_id.toString() === user._id.toString()

    // spaces left stored on the class document (decreases when users book)
    const spotsRemaining = danceclass.spotsRemaining

    const handleDelete = async () => {
        if (!user) {
            return //stop if no logged in user
        }

        //send protected delete request for this class
        const response = await authFetch("/api/danceclasses/" + danceclass._id, { method: "DELETE" }, user, logout)

        if (!response) {
            return //stop if authFetch logs user out after 401
        }

        const json = await response.json() //read backend response

        if (response.ok) {
            dispatch({ type: "DELETE_DANCECLASS", payload: json }) //remove deleted class from global state so UI updates straight away
            setShowDeleteModal(false) //close modal after successful delete
            showToast("Your class has been deleted")
        } else {
            console.log(json.error) //log backend error if delete failed
        }
    }

    const handleConfirmUnbook = async () => {
        if (!onUnbook) {
            return
        }

        await onUnbook(danceclass._id)
        setShowUnbookModal(false) //close modal after unbooking
    }

    return (
        <>
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

                <div className="danceclass-footer">
                    <p>{formatDistanceToNow(new Date(danceclass.createdAt), { addSuffix: true })}</p>

                    {/* if the user owns the class - show edit/delete buttons */}
                    {isOwner && (
                        <div className="class-owner-actions">
                            <Link to={`/classes/${danceclass._id}/edit`} className="owner-action-btn edit-action-btn">
                                Edit Class
                            </Link>
                            <button
                                type="button"
                                className="owner-action-btn delete-action-btn"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete Class
                            </button>
                        </div>
                    )}

                    {/* if not owner, and booking is allowed - show book button */}
                    {!isOwner && showBook && (
                        <button
                            type="button"
                            className="card-action-btn book-action-btn"
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
                            className="card-action-btn unbook-btn"
                            onClick={() => setShowUnbookModal(true)}
                        >
                            Unbook Class
                        </button>
                    )}
                </div>
            </div>

            {/* custom delete confirmation modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Class: "{danceclass.title}"</h3>
                        <p>Are you sure you want to delete this class? This action cannot be undone.</p>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="delete-confirm-btn"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* custom unbook confirmation modal */}
            {showUnbookModal && (
                <div className="modal-overlay" onClick={() => setShowUnbookModal(false)}>
                    <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Unbook Class: "{danceclass.title}"</h3>
                        <p>Are you sure you want to unbook this class?</p>

                        <div className="delete-modal-actions">
                            <button
                                type="button"
                                className="secondary-btn"
                                onClick={() => setShowUnbookModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="unbook-confirm-btn"
                                onClick={handleConfirmUnbook}
                            >
                                Unbook
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default DanceClassDetails