const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const app = require('../app')
const User = require('../models/userModel')
const DanceClass = require('../models/danceclassModel')

let mongoServer
let token

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
})

beforeEach(async () => {
  await User.deleteMany({})
  await DanceClass.deleteMany({})

  const signupRes = await request(app)
    .post('/api/user/signup')
    .send({
      email: 'creator@example.com',
      password: 'StrongPass123!'
    })

  token = signupRes.body.token
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

describe('Dance class API', () => {
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
})