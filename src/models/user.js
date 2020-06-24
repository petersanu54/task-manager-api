const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Tasks = require('./tasks.js')
const { Binary } = require('mongodb')

const schemaUser = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    password: {
        type : String,
        trim : true,
        required : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('is password')
            }
        }
    },
    age : {
        type : Number,
        default : 0
    },
    email : {
        type : String,
        unique : true,
        required : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email')
            }
        }
    },
    tokens :[{
        token : {
            type : String,
            required : true
        }
    }],
    avatar:{
        type: Buffer
    }

    //just like we defined a user referece(ref) in tasks the ssame we will perform in users for task to get the info takss created by the user.
    //so we will use virtual proprty - A virtual property is not a data stored in database. Its a relationship b/w  entities. In this case b/w user annd tasks
},{
    timestamps:true
})
//any name for virtual like tasks 
// schemaUser.virtual('task',{
//     ref : 'Tasks', //this won't be stored in database like in case of tasks. but just for mongoose to figure out who owns what and how they are related
//     localField : 'id', //is where the local data is stored. so it will be arealtionship b/w the taks and owner 
//     foreignField : 'owner' //is the name of the firld in this case on the task that will create the relationship

// })

schemaUser.virtual('task',{
    ref : 'tasks',
    localField : '_id',
    foreignField : 'owner'
})


schemaUser.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error ('Invalid username or password')
    }
    const passwordCheck = await bcrypt.compare(password, user.password)
    if(!passwordCheck){
        throw new Error('Invalid username or password')
    }
    return user
}

schemaUser.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({_id:user.id.toString()}, process.env.JWT_SECRET_KEY)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


//return user info without password and tokens
// schemaUser.methods.getPublicProfile = function(){ ---- we can use the toJSON. s wen ever we use res.send({user}) the toJSON function will called which will manipulate the user. may bein login/signup/logout
schemaUser.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.tokens
    delete userObject.password

    //deleting the avatar from res so that we don't et such a large data when reading the profile of user
    delete userObject.avatar
    
    return userObject
}

schemaUser.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
    //if next() is not used it will o on a loop
})

schemaUser.pre('remove', async function(next){
    const user = this
    await Tasks.deleteMany({owner:user.id})
    next()
})

const User = mongoose.model('User',schemaUser)

module.exports = User