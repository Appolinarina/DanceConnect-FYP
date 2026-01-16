const User = require('../models/userModel') //user collection to save/create new documents

//login user
const loginUser = async (req, res) => {
    res.json({mssg: 'user login'})
}

//signup user
const signupUser = async (req, res) => {
    res.json({mssg: 'user signup'})
}

module.exports = {loginUser, signupUser}