const User = require('../models/userModel') //user collection to save/create new documents

//login user
const loginUser = async (req, res) => {
    res.json({mssg: 'user login'})
}

//signup user
const signupUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.signup(email, password) //signup function from userModel
        res.status(200).json({email, user}) //send back email that the user signed up with, and the user object
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {loginUser, signupUser}