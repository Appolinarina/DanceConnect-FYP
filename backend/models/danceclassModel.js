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
        required: true,
        min: [0, 'Capacity cannot be negative']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    user_id: {
        type: String,
        required: true
    },
    spotsRemaining: {
        type: Number,
        required: true,
        min: [0, 'Spots remaining cannot be negative']
    }
}, {timestamps: true}) //to automatically add timestamps property

danceClassSchema.index({ date: 1 }) //date index

module.exports = mongoose.model('danceClass', danceClassSchema)
