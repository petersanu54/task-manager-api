const express = require('express')
const userRouter = require('./routes/users.js')
const taksRouter = require('./routes/tasks.js')
const app = express()
const router = new express.Router
require('./db/mongoose.js')

const port  = process.env.PORT || 3000




app.use(express.json())
app.use(router)
app.use(userRouter)
app.use(taksRouter)
//app.use(taskRouter and userRouter must be the last one after app.use(router))
app.listen(port, ()=>{
    console.log('port is up and running on', port)
})
