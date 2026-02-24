const User = require('../models/userModel') //user collection to save/create new documents
const jsonwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jsonwt.sign({_id}, process.env.SECRET, {expiresIn: '2d'})
}

//login user
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password) //login function from userModel

        //create json web token
        const token = createToken(user._id)

        res.status(200).json({email, token, _id: user._id}) //send back email that the user login with, and the token, and user id
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//signup user
const signupUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.signup(email, password) //signup function from userModel

        //create json web token
        const token = createToken(user._id)

        res.status(200).json({email, token, _id: user._id}) //send back email that the user signed up with, and the token, and user id
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {loginUser, signupUser}