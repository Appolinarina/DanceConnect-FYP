const DanceClassDetails = ({danceclass}) => {
    return (
        <div className="danceclass-details">
            <h4>{danceclass.title}</h4>
            <p><strong>Style: </strong>{danceclass.dance_style}</p>
            <p><strong>Level: </strong>{danceclass.dance_level}</p>
            <p><strong>Location: </strong>{danceclass.location}</p>
            <p><strong>Time: </strong>{danceclass.date}</p>
            <p>{danceclass.createdAt}</p>
        </div>
    )
}

export default DanceClassDetails