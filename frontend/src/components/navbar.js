import { Link } from "react-router-dom"//import link from react router DOM package

const Navbar = () =>{

    return (
        <header>
            <div className="container">
                <Link to="/">
                <h1>DanceConnect</h1>
                </Link>
            </div>
        </header>
    )
}

export default Navbar