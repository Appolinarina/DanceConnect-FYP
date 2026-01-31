const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')

const Schema = mongoose.Schema

const userSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }

})

//static signup method
userSchema.statics.signup = async function(email, password) { 

    //validation
    if (!email || !password){
        throw Error('All fields must be filled')
    }

    if (!validator.isEmail(email)){ //return true or false if email valid/invalid
        throw Error('Email is not valid')
    } 
    
    if (!validator.isStrongPassword(password)){
        throw Error('Password not strong enough')
    }

    //see if email exists in database, if it does, don't complete signup (email must be unique)
    const exists = await this.findOne({email})

    if (exists) {
        throw Error('Email already in use')
    }

    //add salt to password, then hash password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    // store password alongside user email (create document)
    const user = await this.create({email, password: hash}) //store hash as password in document

    return user
}

module.exports = mongoose.model('User', userSchema)