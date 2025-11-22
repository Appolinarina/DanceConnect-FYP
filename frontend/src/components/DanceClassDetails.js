import { useDanceClassesContext } from "../hooks/useDanceClassContext"

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
            <p><strong>Time: </strong>{danceclass.date}</p>
            <p>{danceclass.createdAt}</p>
            <span onClick={handleClick}>Delete</span>
        </div>
    )
}

export default DanceClassDetails