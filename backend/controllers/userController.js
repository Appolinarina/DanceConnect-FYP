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

//get current logged in user's profile
const getMyProfile = async (req, res) => {
    try {
        //find the currently logged in user by the id added in requireAuth
        //only return the profile fields needed for this page
        const user = await User.findById(req.user._id).select('_id email name aboutMe')

        //if no user found with that id
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        //send back the user's profile information
        res.status(200).json(user)
        
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

//update current logged in user's profile
const updateMyProfile = async (req, res) => {
    const name = req.body.name ? req.body.name.trim() : ''
    const aboutMe = req.body.aboutMe ? req.body.aboutMe.trim() : ''

    //prevent about me from going over 200 characters
    if (aboutMe.length > 200) {
        return res.status(400).json({error: 'About me must be 200 characters or less'})
    }

    try {
        //find current logged in user and only update profile fields
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, aboutMe },
            { new: true, runValidators: true } //return updated document, runvalidators makes sure schema rules are still followed
        ).select('_id email name aboutMe')

        //if no user found with that id
        if (!user) {
            return res.status(404).json({error: 'User not found'})
        }

        //send back the updated user profile
        res.status(200).json(user)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    loginUser,
    signupUser,
    getMyProfile,
    updateMyProfile
}