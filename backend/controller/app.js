//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865

import express from 'express'
var app = express();
import user from '../model/user.js'
import bodyParser from 'body-parser'
import connection from "../model/databaseConfig.js"
import util from "util"

import jwt from 'jsonwebtoken'
import JWT_SECRET from '../config.js'
import isLoggedInMiddleware from '../auth/isLoggedInMiddleware.js'

import cors from 'cors'
app.use(cors())

var query = util.promisify(connection.query).bind(connection);

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json())
app.use(urlencodedParser)

const err_msg = { "error_msg": "Internal server error" }
//Endpoint 1
app.get('/actors/:actor_id', async (req, res) => {
    try {
        const id = req.params.actor_id
        const response = await user.get_actor(id)

        if (response.length === 0) {
            return res.status(204).send("No Content. Record of given actor_id cannot be found.")
        } else {
            return res.status(200).json(response[0])
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json(err_msg);
    }


})
//Endpoint 2
app.get('/actors', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const response = await user.get_actors(limit, offset)

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})
//Endpoint 3
app.post('/actors/', async (req, res) => {
    try {
        const { first_name, last_name } = req.body

        if (!first_name || !last_name) {
            return res.status(400).json({ error_msg: "missing data" })
        }

        const response = await user.new_actor(first_name, last_name)
        return res.status(200).json({ actor_id: response.insertId })
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})
//Endpoint 4
app.put('/actors/:actor_id', async (req, res) => {
    const id = req.params.actor_id
    if (!req.body.first_name && !req.body.last_name) {
        return res.status(400).json({ "error_msg": "missing data" })
    }

    if (req.body.first_name == "" && req.body.last_name == "") {
        return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
    }
    try {
        const response = await user.update_actor(req.body, id)

        if (response.affectedRows == 0) {
            return res.status(204).send("No Content. Record of given actor_id cannot be found.")
        }
        else {
            return res.status(200).json({ success_msg: "record updated" })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})
//Endpoint 5
app.delete('/actors/:actor_id', async (req, res) => {
    try {
        const id = req.params.actor_id
        if (!id) {
            return res.status(204).send()
        }

        await query("START TRANSACTION")
        const response1 = await user.delete_film_actor(id)
        const response2 = await user.delete_actor(id)
        await query('COMMIT')
        if (response2.affectedRows == 0) {
            return res.status(204).send()
        } else {
            return res.status(200).json({ success_msg: "actor deleted" });
        }
    } catch (error) {
        await query("ROLLBACK")
        console.log(error)
        return res.status(500).json(err_msg)
    }

})
//Endpoint 6
app.get('/films', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || " ";
        console.log(search)
        const response = await query("SELECT f.*,c.category_id,c.name FROM film f ,film_category fc, category c WHERE f.film_id = fc.film_id AND fc.category_id = c.category_id AND f.title LIKE ? LIMIT ? OFFSET ? ",
        ["%"+search+"%",limit,offset])

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }

})

app.get('/categories', async (req, res) => {
    try {
        const response = await query("SELECT category_id,name FROM category ")

        return res.status(200).json(response)
    }catch(error){
        console.log(error)
        return res.status(500).json(err_msg)
    }
    
})

app.get('/film_categories/:category_id/films', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || "";
        const id = parseInt(req.params.category_id)

        const response = await user.get_films(limit,offset,search,id)

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})
//Endpoint 7
app.get('/customer/:customer_id/payment', async (req, res) => {


    try {
        const id = req.params.customer_id
        const start = req.query.start_date
        const end = req.query.end_date

        const response = await user.get_payment(id, start, end)

        var total = 0
        if (response.length !== 0) {
            response.forEach(obj => total += parseFloat(obj.amount))
        }

        return res.status(200).json({ rental: response, total: total.toFixed(2) })
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})
//endpoint 8
app.post('/customers', async (req, res) => {
    try {
        const check1 = ["store_id", "first_name", "last_name", "email", "address"]
        const check2 = ["address_line1", "address_line2", "district", "city_id", "postal_code", "phone"]
        for (var i of check1) {
            if (!req.body[i]) {
                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }
        for (var i of check2) {
            if (req.body.address[i] == null) {
                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }


        let response = await query("SELECT email from customer WHERE email LIKE ?", [req.body.email])

        if (response.length !== 0) {
            return res.status(409).json({
                error_msg: "email already exist",
            });
        }

        await query("START TRANSACTION")
        let address_response = await user.addAddress(req.body.address)
        let customer_response = await user.addCustomer(req.body)
        await query("COMMIT")

        let insertId = customer_response.insertId;
        return res.status(200).json({ customer_id: insertId });
    } catch (error) {
        await query("ROLLBACK")
        console.log(error)
        return res.status(500).json(err_msg)
    }

})

//Endpoint 9, POST a new rental and payment, Need 
app.post('/rental', async (req, res) => {
    try {
        const check = ["film_id", "store_id", "customer_id", "staff_id", "amount"]
        for (var i of check) {
            if (req.body[i] == null) {
                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }

        let stock = await user.getStock(req.body.film_id, req.body.store_id)
        if (stock.length == 0) {
            return res.status(400).json({ error_msg: "No Stock" })
        }

        await query("START TRANSACTION")
        let rentResponse = await user.addRent(stock[0].inventory_id, req.body)
        let paymentResponse = await user.addPayment(rentResponse.insertId, req.body)
        await query("COMMIT")

        return res.status(201).json({ rental_id: rentResponse.insertId, payment_id: paymentResponse.insertId })

    } catch (error) {
        await query("ROLLBACK")
        console.log(error)
        return res.status(500).json(err_msg)
    }

})



//Endpoint 10 Add a new staff
app.post('/staff', async (req, res) => {
    try {
        const check1 = ["first_name", "last_name", "store_id", "email", "username", "password", "address"]
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

        let response = await query("SELECT email from staff WHERE email LIKE ?", [req.body.email])

        if (response.length !== 0) {
            return res.status(409).json({
                error_msg: "email already exist",
            });
        }

        await query("START TRANSACTION")
        let address_response = await user.addAddress(req.body.address)
        let staff_response = await user.new_staff(req.body, address_response.insertId)
        await query("COMMIT")

        return res.status(201).json({ staff_id: staff_response.insertId })


    } catch (error) {
        await query("ROLLBACK")
        console.log(error)
        return res.status(500).json(err_msg)
    }
})

app.post("/login/", async (req, res) => {
    //Front end side to sha1 the password
    try {


        const response = await user.verify(req.body.email, req.body.password)
        if (response.length == 0) {
            return res.status(401).send()
        }

        const payload = { user_id: response[0].staff_id };
        jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "24h" }, (error,
            token) => {
            if (error) {
                console.log(error);
                res.status(401).send();
                return;
            }
            res.status(200).send({
                token: token,
                user_id: response[0].staff_id
            });
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
});

export default app