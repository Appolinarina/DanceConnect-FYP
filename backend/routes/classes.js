const express = require('express')

const router = express.Router()

// GET all classes
router.get('/', (req, res) => {
    res.json({mssg: 'GET all classes'})
})

// GET a single class
router.get('/:id', (req, res) => {
    res.json({mssg: 'GET a single class'})
})

// POST a new class
router.post('/', (req, res) => {
    res.json({mssg: 'POST a new class'})
})

// DELETE a class
router.delete('/:id', (req, res) => {
    res.json({mssg: 'DELETE a class'})
})

// UPDATE a class
router.patch('/', (req, res) => {
    res.json({mssg: 'UPDATE a class'})
})

module.exports = router