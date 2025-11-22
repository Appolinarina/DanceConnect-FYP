import { useEffect } from "react"
import { useDanceClassesContext } from "../hooks/useDanceClassContext"

//components
import DanceClassDetails from '../components/DanceClassDetails'
import DanceClassForm from '../components/DanceClassForm'

const Home = () => {
    const {danceclasses, dispatch} = useDanceClassesContext() // danceclasses null initially, updates with dispatch

    useEffect(() =>{
        const fetchDanceClasses = async () => {
            const response = await fetch('/api/danceclasses') // fetch data from backend (proxies request to localhost:4000)
            const json = await response.json() // pass json to create array of objects

            if (response.ok) {
                dispatch({type: 'SET_DANCECLASSES', payload:json}) //update entire array of danceclasses (json data is the entire array)
            }
        }

        fetchDanceClasses()
    }, []) // empty array to only fire function once (on render)
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