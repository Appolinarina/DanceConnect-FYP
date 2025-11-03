require('dotenv').config()

const express = require('express')
const classRoutes = require('./routes/classes')

//express app
const app = express()

// middleware, invoke next parameter to be able to move onto next middleware
app.use(express.json()) //looks if request has body
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

//routes
app.use('/api/classes', classRoutes)

//listen for requests
app.listen(process.env.PORT, () => {
    console.log('listening on port', process.env.PORT)
})
