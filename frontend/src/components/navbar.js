import { Link } from "react-router-dom"
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
        <Link to="/">
          <h1>DanceConnect</h1>
        </Link>

        <nav>
          {!user && (
            <div className="nav-links">
              <Link to="/">Browse</Link>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </div>
          )}

          {user && (
            <>
              <div className="nav-links">
                <Link to="/">Browse</Link>
                <Link to="/my-classes">My Classes</Link>
              </div>

              <div className="nav-user">
                <span>{user.email}</span>
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