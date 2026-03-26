const express = require('express')
const {
    getClasses,
    getAllClasses,
    getBrowseClasses,
    getClass,
    createClass,
    deleteClass,
    updateClass
} = require('../controllers/danceclassController')
const requireAuth = require('../middleware/requireAuth')
const {
    bookClass,
    unbookClass,
    getMyBookings,
    getMyUpcomingBookings,
    getMyPastBookings
} = require('../controllers/bookingController')

const router = express.Router() // express router instance

// PUBLIC ROUTES - NO AUTH NEEDED
// GET all classes (for browsing - dont show classes in the past)
router.get('/browse', getBrowseClasses)

// AUTHENTICATED ROUTES
router.use(requireAuth) // user authentication needed for the below routes

// GET all classes
router.get('/all', getAllClasses)

// GET upcoming bookings for user
router.get('/bookings/me/upcoming', getMyUpcomingBookings)

// GET past bookings for user
router.get('/bookings/me/past', getMyPastBookings)

// GET all user bookings
router.get('/bookings/me', getMyBookings)

// GET all user classes
router.get('/', getClasses)

// POST a new class
router.post('/', createClass)

// CREATE a class booking
router.post('/:id/book', bookClass)

// CANCEL a class booking
router.delete('/:id/book', unbookClass)

// GET a single class
router.get('/:id', getClass)

// DELETE a class
router.delete('/:id', deleteClass)

// UPDATE a class
router.patch('/:id', updateClass)

module.exports = router