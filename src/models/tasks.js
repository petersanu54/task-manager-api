const mongoose = require('mongoose')
require('./user.js')

const taskSchema = new mongoose.Schema({
    description : {
        type : 'String',
        required : true,
        trim : true
    },
    completed : {
        type : Boolean,
        default : 'false'
    },
    owner: {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        //ref with User model is used so that we can user information also when we create a task to know the user who is ccreatin it
        ref : 'User'
    }
    
},{
    timestamps:true
})

const tasks = mongoose.model('tasks', taskSchema)

module.exports = tasks