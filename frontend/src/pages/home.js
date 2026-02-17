import { useEffect } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"
import {useAuthContext} from "../hooks/useAuthContext"

//components
import DanceClassDetails from '../components/DanceClassDetails'
import DanceClassForm from '../components/DanceClassForm'

const Home = () => {
    const {danceclasses, dispatch} = useDanceClassesContext() // danceclasses null initially, updates with dispatch
    const {user} = useAuthContext()

    useEffect(() =>{
        const fetchDanceClasses = async () => {

            // fetch data from backend (proxies request to localhost:4000)
            const response = await fetch('/api/danceclasses', {
                headers: { 
                    'Authorization': `Bearer ${user.token}` // send auth header with user token (if token valid, give access to endpoint)
                }
            }) 
            const json = await response.json() // pass json to create array of objects

            if (response.ok) {
                dispatch({type: 'SET_DANCECLASSES', payload:json}) //update entire array of danceclasses (json data is the entire array)
            }
        }

        // if there is value for user, we fetch the classes
        if (user) {
            fetchDanceClasses()
        }
    }, [dispatch, user]) // rerurn useEffect if dispatch functions changes, (+ added user as dependency)
    return (
        <div className="home">
            <div className="danceclasses">
                {danceclasses && danceclasses.map((danceclass) => ( //only map danceclasses if there are danceclass values (i.e. doesnt map anything if danceclasses is null)
                    <DanceClassDetails key={danceclass._id} danceclass={danceclass}/> //find class id, and output each classes' title
                ))}
            </div>
            <DanceClassForm />
        </div>
    )
}

export default Home