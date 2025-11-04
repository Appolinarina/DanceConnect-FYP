require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
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

//connect to db through URI
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
            console.log('Connected to database and listening on port', process.env.PORT)
        })
    }) //fire funciton when complete
    .catch((error) => { 
        console.log(error)
    })
