const express = require('express')

//controller functions
const {loginUser, signupUser} = require('../controllers/userController')

const router = express.Router() // instance of express router

//login route
router.post('/login', loginUser) // sending login data (email + pass) to server

//signup route
router.post('/signup', signupUser)

module.exports = router 