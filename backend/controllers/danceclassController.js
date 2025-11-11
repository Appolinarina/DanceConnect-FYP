const danceClass = require('../models/danceclassModel')
const mongoose = require('mongoose')

//get all classes
const getClasses = async (req, res) => {
    const danceclasses = await danceClass.find({}).sort({createdAt: -1}) //sort classes by newest first

    res.status(200).json(danceclasses)
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
    const {title, dance_style, dance_level, location, price} = req.body
    //add doc to db
        try {
            const danceclass = await danceClass.create({title, dance_style, dance_level, location, price})
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

    const danceclass = await danceClass.findOneAndDelete({_id: id}) //find _id in mongoDB that is same as grabbed id from req

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

    const danceclass = await danceClass.findOneAndUpdate({_id: id}, {
        ...req.body // spread properties off object, whatever properties are in req body, would output in this object
    }) 

    if (!danceclass) {
        return res.status(404).json({error: 'No such class'})
    }
    res.status(200).json(danceclass)

}



module.exports = {
    getClasses,
    getClass,
    createClass,
    deleteClass,
    updateClass
}