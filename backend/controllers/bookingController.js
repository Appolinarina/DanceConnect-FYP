const mongoose = require('mongoose')
const Booking = require('../models/bookingModel')
const DanceClass = require('../models/danceclassModel')

const bookClass = async (req, res) => {
  const { id: classId } = req.params

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(404).json({ error: 'No such dance class' })
  }

  const danceclass = await DanceClass.findById(classId)
  if (!danceclass) {
    return res.status(404).json({ error: 'No such dance class' })
  }

  // stop booking your own class
  if (danceclass.user_id.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: 'You cannot book your own class' })
  }

  // stop booking in the past (optional but sensible)
  if (new Date(danceclass.date) < new Date()) {
    return res.status(400).json({ error: 'You cannot book a class in the past' })
  }

  // capacity check
  const bookedCount = await Booking.countDocuments({ classId })
  if (bookedCount >= danceclass.capacity) {
    return res.status(400).json({ error: 'Class is fully booked' })
  }

  try {
    const booking = await Booking.create({ classId, userId: req.user._id })
    return res.status(200).json(booking)
  } catch (error) {
    // duplicate booking
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already booked this class' })
    }
    return res.status(400).json({ error: error.message })
  }
}

// for showing user 'upcoming classes'
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('classId')
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = { bookClass, getMyBookings }