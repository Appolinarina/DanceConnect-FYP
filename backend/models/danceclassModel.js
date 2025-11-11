const mongoose = require('mongoose')

const Schema = mongoose.Schema

const classSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    dance_style: {
        type: String,
        required: true
    },
    dance_level: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number
    }
}, {timestamps: true}) //to automatically add timestamps property

module.exports = mongoose.model('danceClass', classSchema)
