var express = require('express');
var app = express();
var user = require('../model/user.js');
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json())
app.use(urlencodedParser)

const err_msg = `{"error_msg":"Internal server error"}`

app.get('/actors/:actor_id', (req, res) => {
    const id = req.params.actor_id
    if (isNaN(id)) {
        return res.type('json').status(500).send(err_msg)
    }
    user.get_actor(id, (err, result) => {
        if (err) {
            return res.type('json').status(500).send(`{"error_msg":"Internal server error"}`)
        } else if (result == null) {
            return res.status(204).send()
        } else {
            let end = result.map(({actor_id,first_name,last_name})=>({"actor_id":actor_id.toString(),"first_name":first_name,"last_name":last_name}))[0]
            return res.status(200).send(end)
        }
    })
})

app.get('/actors', (req, res) => {
    const limit = !req.query.limit ? 20 : parseInt(req.query.limit)
    const offset = !req.query.offset ? 0 : parseInt(req.query.offset)

    if (isNaN(limit) || isNaN(offset)) {
        return res.type('json').status(500).send(err_msg)
    }

    user.get_actors(limit, offset, (err, result) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {
            return res.status(200).send(result)
        }
    })
})

app.post('/actors/', (req, res) => {
    user.new_actor(req.body, (err, result) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else if (!result) {
            return res.type('json').status(400).send(JSON.stringify(
                { "error_msg": "missing data" }
            ))


        } else {
            return res.type('json').status(201).send(JSON.stringify(
                { "actor_id": result.toString() }
            ))
        }
    })
})

app.put('/actors/:actor_id', (req, res) => {
    const id = req.params.actor_id
    if (req.body.first_name == null && req.body.last_name == null) {
        return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
    }
    user.update_actor(req.body, id, (err, result) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {
            return res.type('json').status(200).send(JSON.stringify({ "success_msg": "record updated" }))
        }
    })
})

app.delete('/actors/:actor_id', (req, res) => {
    const id = req.params.actor_id
    if (id == null) {
        return res.status(204).send()
    }

    user.delete_actor(id, (err, results) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {
            if (results == 0) {
                return res.status(204).send()
            }
            return res.type('json').status(200).send(JSON.stringify({ "success_msg": "actor_deleted" }))
        }
    })
})

app.get('/film_categories/:category_id/films', (req, res) => {
    const id = req.params.category_id
    user.get_films(id, (err, results) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {

            let end = results.map(({ film_id, title, category, rating, release_year, duration }) => ({ "film_id": film_id.toString(), "title": title, "category": category, "rating": rating, "release_year": release_year.toString(), "duration": duration.toString() }))
            return res.status(200).send(end)
        }
    })
})

app.get('/customer/:customer_id/payment', (req, res) => {
    const id = req.params.customer_id
    const start = req.query.start_date
    const end = req.query.end_date
    user.get_payment(id, start, end, (err, results) => {
        if (err) {
            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {
            if (results.length == 0) {
                return res.type('json').status(200).send(JSON.stringify({ "rental": results, "total": "0" }))
            }
            let sum = 0
            results.forEach(obj => sum += obj.amount)
            results = results.map(({ title, amount, payment_date }) => ({ "title": title, "amount": amount.toFixed(2).toString(), "payment_date": new Date(payment_date.getTime() - (payment_date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ') }))
            return res.type('json').status(200).send(JSON.stringify({ "rental": results, "total": sum.toFixed(2).toString() }))
        }
    })
})

app.post('/customers', (req, res) => {
    const check1 = ["store_id", "first_name", "last_name", "email", "address"]
    const check2 = ["address_line1", "address_line2", "district", "city_id", "postal_code", "phone"]
    for (var i of check1) {
        if (req.body[i] == null) {
            return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
        }
    }
    for (var i of check2) {
        if (req.body.address[i] == null) {
            return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
        }
    }

    user.new_customer(req.body, req.body.address, (err, results) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.type('json').status(409).send(JSON.stringify({"error_msg":"email already exist"}))
            }

            console.log(err)
            return res.type('json').status(500).send(err_msg)
        } else {
            return res.type('json').status(201).send(JSON.stringify({ "customer_id": results }))
        }
    })
})



module.exports = app