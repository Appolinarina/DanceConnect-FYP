require('dotenv').config()

const mongoose = require('mongoose')
const app = require('./app')

const port = process.env.PORT || 4000 //use deployed port if available, otherwise default to 4000 locally

//connect to db through URI
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests only after db connection is successful
        app.listen(port, () => {
            console.log('Connected to database and listening on port', port)
        })
    }) //fire funciton when complete
    .catch((error) => { 
        console.log(error)
    })
