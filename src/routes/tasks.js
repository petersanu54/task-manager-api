const Tasks = require('../models/tasks.js')
const express = require('express')
//const { update } = require('../models/tasks.js')
const router = new express.Router
const auth = require('../middleware/authentication.js')


router.post('/tasks', auth, async (req,res)=>{
    const task = new Tasks({
        ...req.body,
        owner : req.user.id
    })
    //const task = new Tasks(req.body)
    try {
        await task.save()
        res.status(201).send(task)    
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks',auth, async(req,res)=>{
    const match = {}
    const sort = {}

    if (req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sort){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path : 'task',
            match,
            options:{
                limit : parseInt(req.query.limit),
                skip : parseInt(req.query.skip),
                sort
                    //{{url}}/tasks?sortBy=createdAt:desc
                
            }
        }).execPopulate()
        // const result = await Tasks.find({owner: req.user.id})
        //const result = await Tasks.findOne({id, owner: req.user.id})
        res.send(req.user.task)    
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks/:id',auth, async(req,res)=>{
    const id = req.params.id
    try {
        const result = await Tasks.findOne({_id: id, owner: req.user.id})
        //console.log(result)
            
        if(!result){    
            return res.status(404).send()
        }
        res.send(result)    
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/tasks/:id', auth,async(req,res)=>{
    try {
        const updates = Object.keys(req.body)
        const validUpdates = ['completed','description']
        const check = updates.every((update) => validUpdates.includes(update))
        if(!check){
            return res.status(400).send('Invalid update')
        }
        const id = req.params.id
        const updateTask = await Tasks.findOne({_id: id, owner: req.user.id})
        updates.forEach((update) => updateTask[update] = req.body[update])
        await updateTask.save()
        //const updateTask = await Tasks.findByIdAndUpdate(req.params.id, req.body, {runValidators:true, new:true})
        if(!updateTask){
            return res.status(404).send()
        }
        res.status(201).send(updateTask)
    } catch (error) {
        res.status(400).send(error)        
    }
})


router.delete('/tasks/:id',auth,async(req,res)=>{
    const id = req.params.id
    try {
        const task = await Tasks.findOneAndDelete({_id:id, owner:req.user.id})
        if(!task){
            res.status(404).send()
        }
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router