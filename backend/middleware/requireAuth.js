const jsonwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {

    //verify user is authenticated
    const {authorisation} = req.headers //grab from headers (contains JWT)

    if (!authorisation) { //check if auth headers have value
        return res.status(401).json({error: 'Authorisation token required'})
    }

    //get token if auth headers exist
    const token = authorisation.split(' ')[1] // grab token only! (after space, grab 2nd half) (e.g. 'Bearer jopiwjoef.weofio.wpefowe')

    try { 
        // verify token
        const {_id} = jsonwt.verify(token, process.env.SECRET) //return token id from payload if it is verified
        req.user = await User.findOne({_id}).select('_id') //find user in db - using only id (dont need email, etc.)
        next() //fire next handler function (from danceclasses.js)
    } catch (error) {
        console.log(error)
        res.status(401).json({error: 'Unauthorised request'})
    }
}
module.exports = requireAuth