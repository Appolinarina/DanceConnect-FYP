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
const { bookClass, getMyBookings, getMyUpcomingBookings } = require('../controllers/bookingController')

const router = express.Router() // express router instance

router.use(requireAuth) //user authentication needed for the below routes

// GET all classes (for browsing - don't show classes in the past)
router.get('/browse', getBrowseClasses)

// GET all classes
router.get('/all', getAllClasses)

// GET upcoming bookings for user
router.get('/bookings/me/upcoming', getMyUpcomingBookings)

// GET all user bookings
router.get('/bookings/me', getMyBookings)

// CREATE a class booking
router.post('/:id/book', bookClass)

// GET all user classes
router.get('/', getClasses)

// GET a single class
router.get('/:id', getClass)

// POST a new class
router.post('/', createClass)

// DELETE a class
router.delete('/:id', deleteClass)

// UPDATE a class
router.patch('/:id', updateClass)

module.exports = router