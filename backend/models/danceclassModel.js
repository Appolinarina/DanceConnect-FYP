const mongoose = require('mongoose')

const Schema = mongoose.Schema

const danceClassSchema = new Schema({
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
    date: {
        type: Date,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {timestamps: true}) //to automatically add timestamps property

module.exports = mongoose.model('danceClass', danceClassSchema)
