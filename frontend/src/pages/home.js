import { useEffect } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import {useAuthContext} from "../hooks/useAuthContext"
import { useLogout } from "../hooks/useLogout"
import { authFetch } from "../utils/authFetch"

//components
import DanceClassDetails from '../components/DanceClassDetails'
import DanceClassForm from '../components/DanceClassForm'

const Home = () => {
    const {danceclasses, dispatch} = useDanceClassesContext() // danceclasses null initially, updates with dispatch
    const {user} = useAuthContext()
    const { logout } = useLogout()
    

    useEffect(() =>{
        const fetchDanceClasses = async () => {


        // fetch data from backend (proxies request to localhost:4000)
        const response = await authFetch("/api/danceclasses", {}, user, logout) // auth header is passed in authFetch.js

        if (!response) {
            return // if 401 (user logged out)
        }

        const json = await response.json() // pass json to create array of objects
        
        if (response.ok) {
        dispatch({ type: "SET_DANCECLASSES", payload: json }) //update entire array of danceclasses (json data is the entire array)
        }
        }

        // if there is value for user, we fetch the classes
        if (user) {
            fetchDanceClasses()
        }
    }, [dispatch, user]) // rerurn useEffect if dispatch functions changes, (+ added user as dependency)
   return (
    <div className="home">
        <div className="page-panel">
            <h2 className="section-title">My Classes</h2>
            <p className="section-subtitle">
                Manage the classes you have created.
            </p>

            {danceclasses && danceclasses.length === 0 && (
                <div className="empty-state">
                You have not created any classes yet. Use the form on the right to add your first class.
                </div>
            )}

            {danceclasses && danceclasses.length > 0 && danceclasses.map((danceclass) => (
                <DanceClassDetails key={danceclass._id} danceclass={danceclass} />
            ))}
        </div>
        <DanceClassForm />
    </div>
    )
}

export default Home