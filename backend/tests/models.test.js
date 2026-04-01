const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const User = require('../models/userModel')
const DanceClass = require('../models/danceclassModel')
const Booking = require('../models/bookingModel')

let mongoServer

// connect to in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

// clear collections after each test so tests do not affect each other
afterEach(async () => {
  await Booking.deleteMany({})
  await DanceClass.deleteMany({})
  await User.deleteMany({})
})

// close database connection after all tests finish
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

describe('Database model tests', () => {
  // test user signup stores a hashed password instead of plain text
  test('User model should store a hashed password after signup', async () => {
    const user = await User.signup('hashcheck@example.com', 'StrongPass123!')

    expect(user.email).toBe('hashcheck@example.com')
    expect(user.password).not.toBe('StrongPass123!')
    expect(user.password.length).toBeGreaterThan(20)
  })

  // test duplicate user email is not allowed
  test('User model should not allow duplicate email addresses', async () => {
    await User.signup('duplicate@example.com', 'StrongPass123!')

    await expect(
      User.signup('duplicate@example.com', 'StrongPass123!')
    ).rejects.toThrow('Email already in use')
  })

  // test dance class requires all mandatory fields
  test('DanceClass model should require mandatory fields', async () => {
    await expect(
      DanceClass.create({
        title: 'Incomplete Class'
      })
    ).rejects.toThrow()
  })

  // test dance class stores correct data values
  test('DanceClass model should store class data correctly', async () => {
    const danceClass = await DanceClass.create({
      title: 'Salsa Beginners',
      dance_style: 'Salsa',
      dance_level: 'Beginner',
      location: 'Dublin Studio',
      date: new Date('2026-06-01T18:00:00.000Z'),
      capacity: 20,
      price: 10,
      user_id: '123456789012345678901234',
      spotsRemaining: 20
    })

    expect(danceClass.title).toBe('Salsa Beginners')
    expect(danceClass.dance_style).toBe('Salsa')
    expect(danceClass.dance_level).toBe('Beginner')
    expect(danceClass.location).toBe('Dublin Studio')
    expect(danceClass.capacity).toBe(20)
    expect(danceClass.price).toBe(10)
    expect(danceClass.spotsRemaining).toBe(20)
    expect(danceClass.user_id).toBe('123456789012345678901234')
  })

  // test booking can be created with valid class and user ids
  test('Booking model should create a valid booking', async () => {
    const user = await User.create({
      email: 'bookinguser@example.com',
      password: 'hashedpassword'
    })

    const danceClass = await DanceClass.create({
      title: 'Hip Hop Basics',
      dance_style: 'Hip Hop',
      dance_level: 'Open',
      location: 'Studio 1',
      date: new Date('2026-06-05T18:00:00.000Z'),
      capacity: 15,
      price: 8,
      user_id: user._id.toString(),
      spotsRemaining: 15
    })

    const booking = await Booking.create({
      classId: danceClass._id,
      userId: user._id
    })

    expect(booking).toHaveProperty('_id')
    expect(booking.classId.toString()).toBe(danceClass._id.toString())
    expect(booking.userId.toString()).toBe(user._id.toString())
  })

  // test duplicate booking for the same class and user is not allowed
  test('Booking model should not allow duplicate bookings for the same class and user', async () => {
    const user = await User.create({
      email: 'duplicatebooking@example.com',
      password: 'hashedpassword'
    })

    const danceClass = await DanceClass.create({
      title: 'Contemporary Flow',
      dance_style: 'Contemporary',
      dance_level: 'Intermediate',
      location: 'Studio 2',
      date: new Date('2026-06-10T18:00:00.000Z'),
      capacity: 12,
      price: 9,
      user_id: user._id.toString(),
      spotsRemaining: 12
    })

    await Booking.create({
      classId: danceClass._id,
      userId: user._id
    })

    await expect(
      Booking.create({
        classId: danceClass._id,
        userId: user._id
      })
    ).rejects.toThrow()
  })

  // test booking requires both classId and userId
  test('Booking model should require both classId and userId', async () => {
    await expect(
      Booking.create({})
    ).rejects.toThrow()
  })
})