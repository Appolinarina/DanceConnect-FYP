const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const app = require('../app')
const User = require('../models/userModel')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  await mongoose.connect(uri)
})

afterEach(async () => {
  await User.deleteMany({})
})

afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
  await mongoServer.stop()
})

describe('User API', () => {
  test('POST /api/user/signup should sign up a user successfully', async () => {
    const res = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('email', 'test@example.com')
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('_id')
  })

  test('POST /api/user/signup should fail if email already exists', async () => {
    await request(app)
      .post('/api/user/signup')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    const res = await request(app)
      .post('/api/user/signup')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Email already in use')
  })

  test('POST /api/user/login should log in an existing user', async () => {
    await request(app)
      .post('/api/user/signup')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('email', 'test@example.com')
    expect(res.body).toHaveProperty('token')
    expect(res.body).toHaveProperty('_id')
  })

  test('POST /api/user/login should fail with wrong password', async () => {
    await request(app)
      .post('/api/user/signup')
      .send({
        email: 'test@example.com',
        password: 'StrongPass123!'
      })

    const res = await request(app)
      .post('/api/user/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPass123!'
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Incorrect password')
  })

  test('GET /api/user/me should fail without token', async () => {
    const res = await request(app)
      .get('/api/user/me')

    expect(res.statusCode).toBe(401)
    expect(res.body).toHaveProperty('error', 'Authorization token required')
  })
})