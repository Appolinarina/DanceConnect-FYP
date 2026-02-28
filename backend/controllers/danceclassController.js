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

    const futureClasses = await danceClass
      .find({ date: { $gt: now } }) //class time later than now
      .sort({ date: 1 }) //sort oldest to newest

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
    if(!capacity) {
        emptyFields.push('capacity')
    }
    if(!price) {
        emptyFields.push('price')
    }

    //if any fields left empty
    if(emptyFields.length > 0){
        return res.status(400).json({error:'Please fill in all required fields', emptyFields})
    }

    //add doc to db
        try {
            const user_id = req.user._id
            const danceclass = await danceClass.create({title, dance_style, dance_level, location, date, capacity, price, user_id})
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
    const {id} = req.params //grab id from request parameters

    if(!mongoose.Types.ObjectId.isValid(id)){ //if no class id in database - error handling
        return res.status(404).json({error: 'No such dance class'})
    }

    const danceclass = await danceClass.findOneAndUpdate(
        {_id: id, user_id: req.user._id}, //only allow class creator to update class
        {...req.body}, // spread properties off object, whatever properties are in req body, would output in this object
        {new: true}
    ) 

    if (!danceclass) {
        return res.status(404).json({error: 'No such class'})
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