const express = require('express')

//controller functions
const {
    loginUser,
    signupUser,
    getMyProfile,
    updateMyProfile
} = require('../controllers/userController')

const requireAuth = require('../middleware/requireAuth')

const router = express.Router() // instance of express router

//login route
router.post('/login', loginUser) // sending login data (email + pass) to server

//signup route
router.post('/signup', signupUser)

//protected profile routes
router.get('/me', requireAuth, getMyProfile)
router.patch('/me', requireAuth, updateMyProfile)

module.exports = router