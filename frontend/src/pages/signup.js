import {useState} from 'react'
import { useSignup } from '../hooks/useSignUp'
import { Link } from "react-router-dom"

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const {signup, error, isLoading} = useSignup()

    const handleSubmit = async(e) => {
        e.preventDefault() //prevent page refresh upon hitting submit button
        await signup(email, password) // pass in inputed email and pass from form (that are being stored in state)
    }

    return (
        <div className="auth-page">
            <form className='signup' onSubmit={handleSubmit}>
            <h3>Sign Up</h3>

            <label>Email:</label>
            <input type="email" onChange={(e)=>setEmail(e.target.value)} value={email} />

            <label>Password:</label>
            <input type="password" onChange={(e)=>setPassword(e.target.value)} value={password} />

            <button disabled={isLoading}>Sign Up</button>
            {error && <div className="error">{error}</div>}
            <p className="auth-switch-text">
                Already have an account? <Link to="/login">Login here</Link>
            </p>
            </form>
        </div>
    )
}

export default Signup