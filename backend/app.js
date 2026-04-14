require('dotenv').config()

const express = require('express')
const cors = require('cors')
const classRoutes = require('./routes/danceclasses')
const userRoutes = require('./routes/user')

const app = express()

//allow local frontend during development + deployed frontend later
app.use(cors({
  origin: function (origin, callback) {
    //allow requests with no origin too, e.g. Insomnia or other non-browser tools
    if (!origin) {
      return callback(null, true)
    }

    //allow any localhost frontend while developing
    if (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:')
    ) {
      return callback(null, true)
    }

    //allow deployed frontend later
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS')) //block anything else
  }
}))

// middleware
app.use(express.json()) //looks if request has body
app.use((req, res, next) => {
  console.log(req.path, req.method) //log request path and method to console
  next()
})

// routes
app.use('/api/danceclasses', classRoutes)
app.use('/api/user', userRoutes)

module.exports = app