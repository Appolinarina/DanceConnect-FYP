const express = require('express')
const {
    getClasses,
    getClass,
    createClass,
    deleteClass,
    updateClass
} = require('../controllers/danceclassController')

const router = express.Router()

// GET all classes
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