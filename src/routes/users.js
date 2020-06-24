const User = require('../models/user.js')
const express = require('express')
const router = new express.Router
const auth = require('../middleware/authentication.js')
const multer = require('multer')
const sharp = require('sharp')
const {sendMsg} = require('../emails/accounts.js')
const {sendMsgOnDeletion} = require('../emails/accounts.js')


//sinup
router.post('/users',async (req,res)=>{
    
    try {
        const user = new User(req.body)
        const token = await user.generateToken()
        await user.save()
        sendMsg(user.email, user.name)
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

//login

router.post('/users/login', async (req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        
        res.send({user,token})   
    } catch (error) {
        res.status(400).send(error)
    }
})


router.post('/users/logout', auth, async(req,res)=>{
    try {
        //don't need to get user again as i am alreaddy authenticated. req.user.tokens is my tokenn array
        req.user.tokens = req.user.tokens.filter((token)=>{
        //ccheck if the token is present in req.user.tokens
        return token.token !== req.token
        //will overrite the existing user.token and if nomatch then add to the user.token list else will exit and don't sae the matched token
    })
    await req.user.save()
       
    res.send('logged out')
    } catch (error) {
        res.send(500).send()
    }
})

router.post('/users/logoutAll', auth, async(req,res)=>{
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send('logged out from All devices')
    } catch (error) {
        res.status(500).send()
    }
})




//read all users
//added a middleware function in second argument
router.get('/users/me',auth,async (req,res)=>{
    //this will redirect to our profile so the user can only access their own created tasks
    //we will send back the user that we stored durin authentication
    
    res.send(req.user)
})


// router.get('/users/:id',async(req,res)=>{
//     try {
//         const userId = req.params.id
//         const userFind = await User.findById(userId)
//         if(!userFind){
//             return res.status(404).send('Users not found')
//         }
//         res.status(201).send(userFind)
//     } catch (error) {
//         res.status(400).send(error)
//     }
// })

router.patch('/users/me',auth,async(req,res)=>{
    try {
        const updates = Object.keys(req.body)
        const validUpdates = ['age','name','email','password']
        const check = updates.every((update) => validUpdates.includes(update))
        if(!check){
            return res.status(400).send('Invalid update')
        }
        // const updateUs er = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        //const updateUser = await User.findByIdAndUpdate(req.params.id, req.body,{new:true,runValidators:true})
            // if(!updateUser){
            //     return res.status(404).send('no user found')
            // }
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me',auth, async(req,res)=>{
    try {
        // const user = await User.findByIdAndDelete(req.user.id)
        // if(!user){
        //     return res.status(404).send('Users not found')
        // }
        await req.user.remove()
        sendMsgOnDeletion(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

const upload = multer({
    // dest : 'avatar',
    limits : {
        fileSize : 100000000
    },
    fileFilter(req, file, callback){
        //if(!file.originalname.endsWith('.pdf')){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Please upload jpg or jpeg or png file'))
        }

        callback(undefined, true)
        // callback(new Error('File must be a pdf'))
        // callback(undefined, true)
        // callback(undefined, false)

    }
})

// const middleware = (req,res,next)=>{
//     throw new Error('From middleware')
// }

router.post('/users/me/avatar',auth, upload.single('avatar'),async (req,res)=>{
//when we don't have the dest option setup then we will use the below to save the file
    const buffer = await sharp(req.file.buffer).resize({height:100,width:100}).png().toBuffer()
    req.user.avatar = buffer
    //req.user.avatar = req.file.buffer
    console.log(req.user.avatar)
    await req.user.save()
     res.send('saved')
},(error,req,res,next)=>{   
    res.status(400).send({error:error.message})
})

//delete the file
router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//get back the avatar by their user id
router.get('/users/:id/avatar',async(req,res)=>{
    try {
        const user = await User.findById(req.params.id)
        console.log(user.avatar)
        if(!user || !user.avatar){
            throw new Error()
        }
        //now user response header to tell the user what type of image or file they are getting back (jpg,doc,jpeg,png)
        //we can user response header by res.set and it takes a key value pair (name of the response header we are tryig to set, the value we are trying to set on it)
        res.set('Content-Type','image/jpg')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})
module.exports = router
