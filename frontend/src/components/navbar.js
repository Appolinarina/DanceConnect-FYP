import { Link } from "react-router-dom"//import link from react router DOM package
import { useLogout } from "../hooks/useLogout"
import { useAuthContext } from "../hooks/useAuthContext"

const Navbar = () => {
    const {logout} = useLogout()
    const {user} = useAuthContext()

    const handleLogout = () => {
        logout()
    }

    return (
        <header>
            <div className="container">
                <Link to="/">
                <h1>DanceConnect</h1>
                </Link>
                <nav>
                    {!user && ( // only show this navbar if user isn't logged in
                        <div>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </div>
                    )}
                    {user && ( // only show Logout button if user is logged in
                        <div>
                            <span>{user.email}</span>
                            <button onClick={handleLogout}>Logout</button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default Navbar