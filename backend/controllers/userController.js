const User = require('../models/userModel') //user collection to save/create new documents

//login user
const loginUser = async (req, res) => {
    res.json({mssg: 'user login'})
}

//signup user
const signupUser = async (req, res) => {
    res.json({mssg: 'user signup'})
}

//static signup method
userSchema.statics.signup = async (email, password) => { 
    //see if email exists in database, if it does, don't complete signup (email must be unique)
    const exists = await this.findOne({email})

    if (exists) {
        throw Error('Email already in use')
    }

}

module.exports = {loginUser, signupUser}