import { Link, NavLink } from "react-router-dom"
import { useLogout } from "../hooks/useLogout"
import { useAuthContext } from "../hooks/useAuthContext"

const Navbar = () => {
  const { logout } = useLogout()
  const { user } = useAuthContext()

  const handleLogout = () => {
    logout()
  }

  return (
    <header>
      <div className="container">
        <Link to="/" className="logo-container">
          <img src="images/logo_beige.png" alt="DanceConnect logo" className="logo" />
          <h1>DanceConnect</h1>
        </Link>

        <nav>
          {!user && (
            <div className="nav-links">
              <NavLink to="/" end>Browse</NavLink>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </div>
          )}

          {user && (
            <>
              <div className="nav-links">
                <NavLink to="/" end> Browse</NavLink>
                <NavLink to="/my-classes">Create a Class</NavLink>
                <NavLink to="/profile">My Profile</NavLink>
              </div>

              <div className="nav-user">
                <span className="nav-user-email">{user.email}</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar