const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

const auth = async (req,res,next)=>{
    
    try {
        //header returns the string token with bearer
        //replace to remove bearer keyword
        
        const token = req.header('Authorization').replace('Bearer ','')
        //token is actually created by our server and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        //now if the token verified successfully we will ather the user by find one on the basis of id as the deoded has the user id adter verification is sucessfull with the secret key 'thisismynewcourse'
        //i want the token to be part of tokens array
        const user = await User.findOne({id : decoded.id, 'tokens.token' : token })  
        if(!user){
            throw new Error()
        }
        //storing above got user
        req.user = user
        req.token = token
        next()

    } catch (error) {
        res.status(401).send({error : 'please authenticate.'})
    }
}

module.exports = auth