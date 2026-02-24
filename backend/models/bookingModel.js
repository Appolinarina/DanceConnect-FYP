const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookingSchema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: 'danceClass', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true })

// prevent duplicate bookings
bookingSchema.index({ classId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Booking', bookingSchema)