const danceClass = require('../models/danceclassModel')
const mongoose = require('mongoose')

//get all classes (for single user to see their own classes)
const getClasses = async (req, res) => {
    const user_id = req.user._id

    //show only docs created by the current logged in user
    const danceclasses = await danceClass.find({user_id}).sort({createdAt: -1}) //sort classes by newest first

    res.status(200).json(danceclasses)
}

// get all classes (for browsing/booking other users classes)
const getAllClasses = async (req, res) => {
  const danceclasses = await danceClass
  .find({user_id: { $ne: req.user._id }}) //leave out your created classes while browsing
  .sort({ createdAt: -1 }) //sort classes by newest first
  res.status(200).json(danceclasses)
}

// get upcoming classes for browsing/booking (future only)
const getBrowseClasses = async (req, res) => {
  try {
    const now = new Date()

    // return only classes in the future (i.e. don't show classes in the past)
    const query = {
      date: { $gt: now }
    }

    // KEYWORD SEARCH
    // search by title, dance style, or location
    // partial match + case-insensitive
    const search = req.query.search?.trim()

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } }, // look at title field in mongodb, match search to title value, use regular expression
        { dance_style: { $regex: search, $options: "i" } }, // i for case insensitive
        { location: { $regex: search, $options: "i" } }
      ]
    }

    // Filter by level: beginner / intermediate / advanced / open
    const level = req.query.level
    if (level) {
      query.dance_level = level
    }

    // FILTER PRICE RANGE
    // filter "free only"
    const freeOnly = req.query.freeOnly === "true"
    if (freeOnly) {
      query.price = 0
    } 
    else {
      // otherwise allow min/max price range filtering
      const minPrice = req.query.minPrice
      const maxPrice = req.query.maxPrice

      const priceFilter = {}

      if (minPrice !== undefined && minPrice !== "") {
        priceFilter.$gte = Number(minPrice)
      }

      if (maxPrice !== undefined && maxPrice !== "") {
        priceFilter.$lte = Number(maxPrice)
      }

      // only attach price filter if user provided min or max
      if (priceFilter.$gte !== undefined || priceFilter.$lte !== undefined) {
        query.price = priceFilter
      }
    }

    // SORTING IN FILTERED SEARCH
    const sortOption = req.query.sort

    let sort = { date: 1 } // default: soonest first

    if (sortOption === "price_asc") { //lowest first
      sort = { price: 1 }
    }

    if (sortOption === "price_desc") { //highest first
      sort = { price: -1 }
    }

    if (sortOption === "date_asc") { //soonest first
      sort = { date: 1 }
    }

    if (sortOption === "date_desc") { 
      sort = { date: -1 }
    }

    const futureClasses = await danceClass
      .find(query) // find classes (+ if based on refined search options)
      .sort(sort) // sort based on sort option (price/date)

    res.status(200).json(futureClasses)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

//get a single class
const getClass = async (req, res) => {
    const {id} = req.params //grab id from request parameters

    if(!mongoose.Types.ObjectId.isValid(id)){ //if no class id in database - error handling
        return res.status(404).json({error: 'No such dance class'})
    }

    const danceclass = await danceClass.findById(id)

    if (!danceclass) {
        return res.status(404).json({error: 'No such class'})
    }
    res.status(200).json(danceclass)
}

//create new class
const createClass = async (req, res) => {
    const {title, dance_style, dance_level, location, date, capacity, price} = req.body

    let emptyFields = [] 
    let invalidFields = []

    //detect empty fields when sending POST request
    if(!title) {
        emptyFields.push('title')
    }
    if(!dance_style) {
        emptyFields.push('dance_style')
    }
    if(!dance_level) {
        emptyFields.push('dance_level')
    }
    if(!location) {
        emptyFields.push('location')
    }
    if(!date) {
        emptyFields.push('date')
    }
    if(capacity === undefined || capacity === null || capacity === '') {
        emptyFields.push('capacity')
    }
    if(price === undefined || price === null || price === '') {
        emptyFields.push('price')
    }

    //if any fields left empty
    if(emptyFields.length > 0){
        return res.status(400).json({error:'Please fill in all required fields', emptyFields})
    }

    // convert to numbers
    const capacityNum = Number(capacity)
    const priceNum = Number(price)

    // validate numbers
    if (Number.isNaN(capacityNum) || capacityNum < 0) {
        invalidFields.push('capacity')
    }

    if (Number.isNaN(priceNum) || priceNum < 0) {
        invalidFields.push('price')
    }

    // validate date is not in the past
    // later today is allowed, but any time before now is not
    const classDate = new Date(date)

    if (Number.isNaN(classDate.getTime()) || classDate < new Date()) {
        invalidFields.push('date')
    }

    if (invalidFields.length > 0) {
        // if date is invalid, show date-specific error
        if (invalidFields.includes('date')) {
            return res.status(400).json({
                error: 'Class date cannot be in the past',
                invalidFields
            })
        }

        // otherwise show number validation error
        return res.status(400).json({
            error: 'Capacity or price cannot be negative',
            invalidFields
        })
    }

    //add doc to db
    try {
        const user_id = req.user._id
        const spotsRemaining = capacityNum
        const danceclass = await danceClass.create({
            title,
            dance_style,
            dance_level,
            location,
            date,
            capacity: capacityNum,
            price: priceNum,
            user_id,
            spotsRemaining
        })
        res.status(200).json(danceclass)
    } catch (error){
        res.status(400).json({error: error.message})
    }
}

//delete a class
const deleteClass = async (req, res) => {
    const {id} = req.params //grab id from request parameters

    if(!mongoose.Types.ObjectId.isValid(id)){ //if no class id in database - error handling
        return res.status(404).json({error: 'No such dance class'})
    }

    const danceclass = await danceClass.findOneAndDelete({
        _id: id, //find _id in mongoDB that is same as grabbed id from req
        user_id: req.user._id //only user that created class can delete it
    }) 
    if (!danceclass) {
        return res.status(404).json({error: 'No such class'})
    }
    res.status(200).json(danceclass)
}

//update a class
const updateClass = async (req, res) => {
    const { id } = req.params //grab id from request parameters
    const { title, dance_style, dance_level, location, date, capacity, price } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) { //if no class id in database - error handling
        return res.status(404).json({ error: 'No such dance class' })
    }

    let emptyFields = []
    let invalidFields = []

    // detect empty fields when sending PATCH request
    if (!title) {
        emptyFields.push('title')
    }
    if (!dance_style) {
        emptyFields.push('dance_style')
    }
    if (!dance_level) {
        emptyFields.push('dance_level')
    }
    if (!location) {
        emptyFields.push('location')
    }
    if (!date) {
        emptyFields.push('date')
    }
    if (capacity === undefined || capacity === null || capacity === '') {
        emptyFields.push('capacity')
    }
    if (price === undefined || price === null || price === '') {
        emptyFields.push('price')
    }

    // if any fields left empty
    if (emptyFields.length > 0) {
        return res.status(400).json({ error: 'Please fill in all required fields', emptyFields })
    }

    // convert to numbers
    const capacityNum = Number(capacity)
    const priceNum = Number(price)

    // validate numbers
    if (Number.isNaN(capacityNum) || capacityNum < 0) {
        invalidFields.push('capacity')
    }

    if (Number.isNaN(priceNum) || priceNum < 0) {
        invalidFields.push('price')
    }

    // validate date is not in the past
    // later today is allowed, but any time before now is not
    const classDate = new Date(date)

    if (Number.isNaN(classDate.getTime()) || classDate < new Date()) {
        invalidFields.push('date')
    }

    if (invalidFields.length > 0) {
        // if date is invalid, show date-specific error
        if (invalidFields.includes('date')) {
            return res.status(400).json({
                error: 'Class date cannot be in the past',
                invalidFields
            })
        }

        // otherwise show number validation error
        return res.status(400).json({
            error: 'Capacity or price cannot be negative',
            invalidFields
        })
    }

    // find existing class first so we can recalculate spots remaining correctly
    const existingClass = await danceClass.findOne({
        _id: id,
        user_id: req.user._id
    })

    if (!existingClass) {
        return res.status(404).json({ error: 'No such class' })
    }

    // work out how many places are already booked
    const bookedSpots = existingClass.capacity - existingClass.spotsRemaining

    // do not allow capacity to go below number of existing bookings
    if (capacityNum < bookedSpots) {
        return res.status(400).json({
            error: `Capacity cannot be lower than ${bookedSpots}, because ${bookedSpots} place(s) are already booked`,
            invalidFields: ['capacity']
        })
    }

    // keep existing bookings the same, and adjust available spots around them
    const newSpotsRemaining = capacityNum - bookedSpots


    const danceclass = await danceClass.findOneAndUpdate(
        { _id: id, user_id: req.user._id }, //only allow class creator to update class
        { title, dance_style, dance_level, location, date, capacity: capacityNum, price: priceNum, spotsRemaining: newSpotsRemaining }, //update only these fields
        { new: true, runValidators: true } //validate new inputs so they follow the schema
    )

    if (!danceclass) {
        return res.status(404).json({ error: 'No such class' })
    }

    res.status(200).json(danceclass)
}

module.exports = {
    getClasses,
    getAllClasses,
    getBrowseClasses,
    getClass,
    createClass,
    deleteClass,
    updateClass
}