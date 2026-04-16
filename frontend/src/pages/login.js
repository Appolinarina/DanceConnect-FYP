import {useState} from 'react'
import { useLogin } from '../hooks/useLogin'
import { Link } from "react-router-dom"

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {login, error, isLoading} = useLogin()

    const handleSubmit = async(e) => {
        e.preventDefault() //prevent page refresh upon hitting submit button
        await login(email, password) // pass in inputed email and pass from form (that are being stored in state)
    }

    return (
        <div className="auth-page">
            <form className='login' onSubmit={handleSubmit}>
            <h3>Log In</h3>

            <label>Email:</label>
            <input type="email" onChange={(e)=>setEmail(e.target.value)} value={email} />

            <label>Password:</label>
            <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password} />

            <button disabled={isLoading}>Log In</button>
            {error && <div className="error">{error}</div>}
            <p className="auth-switch-text">
                Do not have an account? <Link to="/signup">Sign up here</Link>
            </p>
            </form>
        </div>
    )
}

export default Login