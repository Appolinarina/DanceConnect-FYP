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

  // stop booking in the past 
  if (new Date(danceclass.date) < new Date()) {
    return res.status(400).json({ error: 'You cannot book a class in the past' })
  }

  // CAPACITY DECREMENTATION IMPLEMENTATION
  // 1. try to reserve a spot (decrease spotsRemaining by 1)
  // only succeeds if spotsRemaining is greater than 0
  const updatedClass = await DanceClass.findOneAndUpdate(
    { _id: classId, spotsRemaining: { $gt: 0 } },
    { $inc: { spotsRemaining: -1 } },
    { new: true }
  )

  // if updatedClass is null means the class was already full
  if (!updatedClass) {
    return res.status(400).json({ error: "Class is fully booked" })
  }

  // 2. create booking
  try {
    const booking = await Booking.create({ classId, userId: req.user._id })
    return res.status(200).json({
      booking,
      spotsRemaining: updatedClass.spotsRemaining
    })
  } catch (error) {

    // if user already booked undo spot reservation
    if (error.code === 11000) {
      await DanceClass.findByIdAndUpdate(classId, { $inc: { spotsRemaining: 1 } })
      return res.status(400).json({ error: "You have already booked this class" })
    }

    // any other error - undo reservation and return error
    await DanceClass.findByIdAndUpdate(classId, { $inc: { spotsRemaining: 1 } })
    return res.status(400).json({ error: error.message })
  }
}

// for showing user booked classes
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

// Return only upcoming bookings (future classes only)
const getMyUpcomingBookings = async (req, res) => {
  try {
    const currentTime = new Date()

    // 1) Find this user's bookings and populate the class
    // 2) Only include classes where class date is in the future
    const bookings = await Booking.find({ userId: req.user._id })
      .populate({
        path: 'classId',
        match: { date: { $gt: currentTime } }
      })
      .sort({ createdAt: -1 })

    // If a booking's class is in the past, populate will set classId to null
    const upcomingBookings = bookings.filter((booking) => booking.classId !== null)

    res.status(200).json(upcomingBookings)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

module.exports = { bookClass, getMyBookings, getMyUpcomingBookings }