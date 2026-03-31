require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')

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
