var express = require('express');
var app = express();
var user = require('../model/user.js');
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended:false})

app.use(bodyParser.json())
app.use(urlencodedParser)

const err_msg = `{"error_msg":"Internal server error"}`

app.get('/actors/:actor_id',(req,res)=>{
    const id = req.params.actor_id
    if (isNaN(id)){
        return res.type('json').status(500).send(err_msg)
    }
    user.get_actor(id,(err,result)=>{
        if(err){
            return res.type('json').status(500).send(`{"error_msg":"Internal server error"}`)
        }else if (result == null){
            return res.status(204).send()
        }else{
            return res.status(200).send(result)
        }
    })
})

app.get('/actors',(req,res)=>{
    const limit = !req.query.limit ? 20 : parseInt(req.query.limit)
    const offset = !req.query.offset ? 0 : parseInt(req.query.offset)

    if (isNaN(limit) || isNaN(offset)){
        return res.type('json').status(500).send(err_msg)
    }

    user.get_actors(limit,offset,(err,result)=>{
        if(err){
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        }else{
            return res.status(200).send(result)
        }
    })
})

app.post('/actors/',(req,res)=>{
    user.new_actor(req.body,(err,result)=>{
        if(err){
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        }else if (!result){
            return res.type('json').status(400).send(JSON.stringify(
                {"error_msg":"missing data"}
            ))


        }else{
            return res.type('json').status(201).send(JSON.stringify(
                {"actor_id":result}
            ))
        }
    })
})

app.put('/actors/:actor_id',(req,res)=>{
    const id = req.params.actor_id
    if (req.body.first_name == null && req.body.last_name == null){
        return res.type('json').status(400).send(JSON.stringify({"error_msg":"missing data"}))
    }
    user.update_actor(req.body,id,(err,result)=>{
        if(err){
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        }else{
            return res.type('json').status(200).send(JSON.stringify({"success_msg":"record updated"}))
        }
    })
})

app.delete('/actors/:actor_id',(req,res)=>{
    const id = req.params.actor_id
    if (id == null){
        return res.status(204).send()
    }

    user.delete_actor(id,(err,results)=>{
        if(err){
            console.log(err)
            return res.status(500).send(err_msg)
        }else{
            if (results == 0){
                return res.status(204).send()
            }
            return res.type('json').status(200).send(JSON.stringify({"success_msg":"actor_deleted"}))
        }
    })
})

module.exports = app