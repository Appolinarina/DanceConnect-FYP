import { useEffect, useState } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import { useAuthContext } from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { authFetch } from "../utils/authFetch"

//components
import DanceClassDetails from '../components/DanceClassDetails'
import DanceClassForm from '../components/DanceClassForm'

const Home = () => {
    const { danceclasses, dispatch } = useDanceClassesContext() // danceclasses null initially, updates with dispatch
    const { user, authIsReady } = useAuthContext()
    const { logout } = useLogout()
    const [showCreateForm, setShowCreateForm] = useState(false) //mobile only toggle for create class form

    useEffect(() => {
        // wait until auth is checked (prevent class fetch until user confirmed)
        if (!authIsReady) {
            return
        }

        const fetchDanceClasses = async () => {
            // fetch data from backend
            const response = await authFetch("/api/danceclasses", {}, user, logout) // auth header is passed in authFetch.js

            if (!response) {
                return // if 401 (user logged out)
            }

            const json = await response.json() // pass json to create array of objects

            if (response.ok) {
                dispatch({ type: "SET_DANCECLASSES", payload: json }) //update entire array of danceclasses
            }
        }

        // if there is value for user, we fetch the classes
        if (user) {
            fetchDanceClasses()
        }
    }, [dispatch, user, authIsReady]) //rerun when user or auth check state changes

    return (
        <div className="home">
            <div className="page-panel">
                <h2 className="section-title">My Classes</h2>
                <p className="section-subtitle">
                    Manage the classes you have created.
                </p>

                {/* mobile only button to show/hide create class form */}
                <div className="mobile-create-class">
                    <button
                        type="button"
                        className="filter-toggle"
                        onClick={() => setShowCreateForm(!showCreateForm)}
                    >
                        {showCreateForm ? "Hide Form" : "Add New Class"}
                    </button>

                    {showCreateForm && (
                        <DanceClassForm onSuccess={() => setShowCreateForm(false)} />
                    )}
                </div>

                {danceclasses && danceclasses.length === 0 && (
                    <div className="empty-state">
                        You have not created any classes yet. Use the create class form to add your first class.
                    </div>
                )}

                {danceclasses && danceclasses.length > 0 && danceclasses.map((danceclass) => (
                    <DanceClassDetails key={danceclass._id} danceclass={danceclass} />
                ))}
            </div>

            {/* desktop only create class form */}
            <div className="desktop-create-class">
                <DanceClassForm />
            </div>
        </div>
    )
}

export default Home