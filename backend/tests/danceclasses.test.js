const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const app = require('../app')
const User = require('../models/userModel')
const DanceClass = require('../models/danceclassModel')
const Booking = require('../models/bookingModel')

let mongoServer
let token

// connect to in-memory database before running tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

// clear collections before each test and create one logged in user
beforeEach(async () => {
  await User.deleteMany({})
  await DanceClass.deleteMany({})
  await Booking.deleteMany({})

  // create first user and store token for authenticated requests
  const signupRes = await request(app)
    .post('/api/user/signup')
    .send({
      email: 'creator@example.com',
      password: 'StrongPass123!'
    })

  token = signupRes.body.token
})

// close database connection after all tests finish
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

describe('Dance class API', () => {
  // test create class fails without token
  test('POST /api/danceclasses should return 401 without token', async () => {
    const res = await request(app)
      .post('/api/danceclasses')
      .send({
        title: 'Salsa Basics',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Dublin Studio',
        date: '2026-04-20T18:00',
        capacity: 20,
        price: 10
      })

    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('error', 'Authorization token required')
  })

  // test create class works with valid token
  test('POST /api/danceclasses should create a class with valid token', async () => {
    const res = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salsa Basics',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Dublin Studio',
        date: '2026-04-20T18:00',
        capacity: 20,
        price: 10
      })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('title', 'Salsa Basics')
    expect(res.body).toHaveProperty('dance_style', 'Salsa')
    expect(res.body).toHaveProperty('dance_level', 'Beginner')
    expect(res.body).toHaveProperty('location', 'Dublin Studio')
    expect(res.body).toHaveProperty('capacity', 20)
    expect(res.body).toHaveProperty('price', 10)
    expect(res.body).toHaveProperty('spotsRemaining', 20)
    expect(res.body).toHaveProperty('user_id')
  })

  // test create class fails if required fields are missing
  test('POST /api/danceclasses should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        dance_style: 'Salsa',
        dance_level: '',
        location: 'Dublin Studio',
        date: '',
        capacity: 20,
        price: 10
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Please fill in all required fields')
    expect(res.body).toHaveProperty('emptyFields')
    expect(res.body.emptyFields).toContain('title')
    expect(res.body.emptyFields).toContain('dance_level')
    expect(res.body.emptyFields).toContain('date')
  })

  // test another user can successfully book a class
  test('POST /api/danceclasses/:id/book should allow another user to book a class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Salsa Basics',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Dublin Studio',
        date: '2026-04-20T18:00',
        capacity: 20,
        price: 10
      })

    const classId = createRes.body._id

    // create second user who will book the class
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'booker@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    const res = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('booking')
    expect(res.body.booking).toHaveProperty('classId', classId)
    expect(res.body).toHaveProperty('spotsRemaining', 19)
  })

  // test user cannot book their own class
  test('POST /api/danceclasses/:id/book should not allow a user to book their own class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Bachata Improvers',
        dance_style: 'Bachata',
        dance_level: 'Intermediate',
        location: 'Dance Hub',
        date: '2026-04-22T19:00',
        capacity: 15,
        price: 12
      })

    const classId = createRes.body._id

    const res = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'You cannot book your own class')
  })
  
  // test user cannot book the same class twice
  test('POST /api/danceclasses/:id/book should not allow duplicate bookings', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Heels Foundations',
        dance_style: 'Heels',
        dance_level: 'Open',
        location: 'City Studio',
        date: '2026-04-25T18:30',
        capacity: 10,
        price: 15
      })

    const classId = createRes.body._id

    // create second user who will book the class
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'duplicatebooker@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    // first booking should succeed
    const firstBookingRes = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(firstBookingRes.statusCode).toBe(200)
    expect(firstBookingRes.body).toHaveProperty('spotsRemaining', 9)

    // second booking should fail
    const secondBookingRes = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(secondBookingRes.statusCode).toBe(400)
    expect(secondBookingRes.body).toHaveProperty('error', 'You have already booked this class')
  })
  
  // test user cannot book a class in the past
  test('POST /api/danceclasses/:id/book should not allow booking a past class', async () => {
    // create class as first user with a past date
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Old Salsa Class',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Old Studio',
        date: '2025-01-10T18:00',
        capacity: 20,
        price: 10
      })

    const classId = createRes.body._id

    // create second user who will try to book the class
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'pastbooker@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    const res = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'You cannot book a class in the past')
  })
  
  // test user cannot book a class if it is already full
  test('POST /api/danceclasses/:id/book should not allow booking a full class', async () => {
    // create class as first user with capacity of 1
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Full Class Test',
        dance_style: 'Hip Hop',
        dance_level: 'Beginner',
        location: 'Studio 1',
        date: '2026-04-28T18:00',
        capacity: 1,
        price: 8
      })

    const classId = createRes.body._id

    // create second user who will take the only available spot
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'firstbooker@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    const firstBookingRes = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(firstBookingRes.statusCode).toBe(200)
    expect(firstBookingRes.body).toHaveProperty('spotsRemaining', 0)

    // create third user who tries to book the already full class
    const signupRes3 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'secondbooker@example.com',
        password: 'StrongPass123!'
      })

    const thirdToken = signupRes3.body.token

    const secondBookingRes = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${thirdToken}`)

    expect(secondBookingRes.statusCode).toBe(400)
    expect(secondBookingRes.body).toHaveProperty('error', 'Class is fully booked')
  })
  
  // test user can successfully cancel a booking
  test('DELETE /api/danceclasses/:id/book should allow a user to cancel their booking', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Cancel Booking Test',
        dance_style: 'Contemporary',
        dance_level: 'Intermediate',
        location: 'Studio 2',
        date: '2026-05-01T18:00',
        capacity: 12,
        price: 10
      })

    const classId = createRes.body._id

    // create second user who will book the class
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'cancelbooker@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    // create booking first
    const bookingRes = await request(app)
      .post(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(bookingRes.statusCode).toBe(200)
    expect(bookingRes.body).toHaveProperty('spotsRemaining', 11)

    // now cancel the booking
    const unbookRes = await request(app)
      .delete(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(unbookRes.statusCode).toBe(200)
    expect(unbookRes.body).toHaveProperty('message', 'Class booking cancelled successfully')
    expect(unbookRes.body).toHaveProperty('classId', classId)
    expect(unbookRes.body).toHaveProperty('spotsRemaining', 12)
  })
  
  // test user cannot cancel a booking they do not have
  test('DELETE /api/danceclasses/:id/book should return 404 if user has not booked the class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Unbook Failure Test',
        dance_style: 'Jazz',
        dance_level: 'Beginner',
        location: 'Studio 3',
        date: '2026-05-03T18:00',
        capacity: 15,
        price: 9
      })

    const classId = createRes.body._id

    // create second user who has not booked the class
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'notbooked@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    const unbookRes = await request(app)
      .delete(`/api/danceclasses/${classId}/book`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(unbookRes.statusCode).toBe(404)
    expect(unbookRes.body).toHaveProperty('error', 'You have not booked this class')
  })
  
  // test creator can successfully update their own class
  test('PATCH /api/danceclasses/:id should allow creator to update their own class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Original Class',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Studio A',
        date: '2026-05-10T18:00',
        capacity: 20,
        price: 10
      })

    const classId = createRes.body._id

    // update class
    const updateRes = await request(app)
      .patch(`/api/danceclasses/${classId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Class',
        dance_style: 'Bachata',
        dance_level: 'Intermediate',
        location: 'Studio B',
        date: '2026-05-12T19:00',
        capacity: 25,
        price: 12
      })

    expect(updateRes.statusCode).toBe(200)
    expect(updateRes.body).toHaveProperty('title', 'Updated Class')
    expect(updateRes.body).toHaveProperty('dance_style', 'Bachata')
    expect(updateRes.body).toHaveProperty('dance_level', 'Intermediate')
    expect(updateRes.body).toHaveProperty('location', 'Studio B')
    expect(updateRes.body).toHaveProperty('capacity', 25)
    expect(updateRes.body).toHaveProperty('price', 12)
  })
  
  // test creator can successfully delete their own class
  test('DELETE /api/danceclasses/:id should allow creator to delete their own class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Delete Me',
        dance_style: 'Jazz',
        dance_level: 'Open',
        location: 'Studio C',
        date: '2026-05-15T18:00',
        capacity: 15,
        price: 8
      })

    const classId = createRes.body._id

    const deleteRes = await request(app)
      .delete(`/api/danceclasses/${classId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(deleteRes.statusCode).toBe(200)
    expect(deleteRes.body).toHaveProperty('_id', classId)
    expect(deleteRes.body).toHaveProperty('title', 'Delete Me')
  })
  
  // test another user cannot update someone else's class
  test('PATCH /api/danceclasses/:id should not allow another user to update someone else’s class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Owner Class',
        dance_style: 'Salsa',
        dance_level: 'Beginner',
        location: 'Studio Owner',
        date: '2026-05-20T18:00',
        capacity: 20,
        price: 10
      })

    const classId = createRes.body._id

    // create second user
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'otheruser@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    // second user tries to update first user's class
    const updateRes = await request(app)
      .patch(`/api/danceclasses/${classId}`)
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        title: 'Hacked Class',
        dance_style: 'Hip Hop',
        dance_level: 'Advanced',
        location: 'Wrong Studio',
        date: '2026-05-21T19:00',
        capacity: 30,
        price: 15
      })

    expect(updateRes.statusCode).toBe(404)
    expect(updateRes.body).toHaveProperty('error', 'No such class')
  })
  
  // test another user cannot delete someone else's class
  test('DELETE /api/danceclasses/:id should not allow another user to delete someone else’s class', async () => {
    // create class as first user
    const createRes = await request(app)
      .post('/api/danceclasses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Protected Class',
        dance_style: 'Jazz',
        dance_level: 'Open',
        location: 'Studio Protected',
        date: '2026-05-22T18:00',
        capacity: 18,
        price: 9
      })

    const classId = createRes.body._id

    // create second user
    const signupRes2 = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'deleteother@example.com',
        password: 'StrongPass123!'
      })

    const secondToken = signupRes2.body.token

    // second user tries to delete first user's class
    const deleteRes = await request(app)
      .delete(`/api/danceclasses/${classId}`)
      .set('Authorization', `Bearer ${secondToken}`)

    expect(deleteRes.statusCode).toBe(404)
    expect(deleteRes.body).toHaveProperty('error', 'No such class')
  })
})
