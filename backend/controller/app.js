//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865

import express, { response } from 'express'
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

var urlencodedParser = bodyParser.urlencoded({ extended: true })

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
app.post('/actors/', isLoggedInMiddleware, async (req, res) => {
    try {
        const body = Object.assign({},req.body)
        const { first_name, last_name } = body

        if (!first_name || !last_name) {
            return res.status(400).json({ error_msg: "missing data" })
        }

        const resp = await query(`SELECT * from actor WHERE actor.first_name = ? AND actor.last_name = ?`,
        [first_name,last_name]
        )
        if (resp.length !== 0) {
            return res.status(409).json({ error: "Actor already exist!" })
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

    try {
        const id = req.params.actor_id

        if (!req.body.first_name && !req.body.last_name) {
            return res.status(400).json({ "error_msg": "missing data" })
        }

        if (req.body.first_name == "" && req.body.last_name == "") {
            return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
        }
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
//Get film by film id

app.get("/films/:film_id", async (req, res) => {
    try {
        const id = parseInt(req.params.film_id)
        const response = await query(`SELECT f.*,c.category_id,c.name as category,l.name as language FROM film f ,film_category fc, category c,language l WHERE f.film_id = fc.film_id AND fc.category_id = c.category_id AND f.language_id = l.language_id AND f.film_id = ? `,
            [id]
        )

        if (response.length == 0) {
            res.status(204).send()
        } else {
            res.status(200).json(response)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(err_msg)
    }
})

app.get("/film_actor/:film_id", async (req, res) => {
    try {
        const id = parseInt(req.params.film_id)
        const response = await query("SELECT a.first_name,a.last_name FROM actor a,film_actor fa WHERE fa.actor_id = a.actor_id AND fa.film_id = ?",
            [id]
        )

        res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})



app.get('/categories', async (req, res) => {
    try {
        const response = await query("SELECT category_id,name FROM category ")

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }

})
app.get('/films', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || " ";
        var maxNum
        if (req.query.max == "-1") {
            maxNum = null
        } else {
            maxNum = parseFloat(req.query.max)
        }
        const response = await query("SELECT f.*,c.category_id,c.name FROM film f ,film_category fc, category c WHERE f.film_id = fc.film_id AND fc.category_id = c.category_id AND f.title LIKE ? AND (? IS NULL OR f.rental_rate < ?) LIMIT ? OFFSET ? ",
            ["%" + search + "%", maxNum, maxNum, limit, offset])

        return res.status(200).json(response)
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }

})

app.get("/sales", isLoggedInMiddleware, async (req, res) => {
    try {
        // if (!req.decodedToken || userID !== req.decodedToken.user_id) {
        //     res.status(403).send();
        //     return;
        // }
        let response = await query(
            `
              SELECT 
                DATE(payment_date) AS date,
                SUM(amount) AS total_sales
              FROM payment
              GROUP BY DATE(payment_date)
            `);

        response = response.map(({ date, total_sales }) => ({ "date": new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' '), "total_sales": total_sales }))
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json(err_msg)
    }


});

app.get("/address", async (req, res) => {
    try {
        let response = await query(`SELECT a.address_id,a.address,a.address2,a.district,a.city_id,c.city,a.postal_code,a.phone FROM address a,city c WHERE a.city_id = c.city_id ORDER BY a.address_id ASC`)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json(err_msg)
    }
})

app.get("/city", async (req, res) => {
    try {
        let response = await query(`SELECT c.city_id,c.city,co.country FROM city c,country co WHERE c.country_id = co.country_id ORDER BY c.city_id ASC`)
        res.status(200).json(response)

    } catch (error) {
        console.log(error)
        res.status(500).json(err_msg)
    }
})





app.get('/film_categories/:category_id/films', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 24;
        const offset = parseInt(req.query.offset) || 0;
        const search = req.query.search || "";
        const id = parseInt(req.params.category_id)
        var maxNum
        if (req.query.max == "-1") {
            maxNum = null
        } else {
            maxNum = parseFloat(req.query.max)
        }

        const response = await user.get_films(limit, offset, maxNum, search, id)

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
app.post('/customers/:address_id', isLoggedInMiddleware, async (req, res) => {
    try {
        const body = Object.assign({}, req.body)
        let address_id = req.params.address_id
        if (isNaN(address_id)) {
            return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
        }
        address_id = parseInt(address_id)
        const check1 = ["store_id", "first_name", "last_name", "email"]
        for (var i of check1) {
            if (!body[i]) {

                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }

        let response = await query("SELECT email from customer WHERE email LIKE ?", [body.email])

        if (response.length !== 0) {
            return res.status(409).json({
                error_msg: "email already exist",
            });
        }

        let customer_response = await query('INSERT INTO customer(store_id,first_name,last_name,email,address_id) VALUES (?,?,?,?,?)', [
            body.store_id,
            body.first_name,
            body.last_name,
            body.email, address_id])
        return res.status(200).json({ customer_id: customer_response.insertId });
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
})

app.post('/customers', isLoggedInMiddleware, async (req, res) => {
    try {
        const body = Object.assign({}, req.body)
        const check1 = ["store_id", "first_name", "last_name", "email", "address"]
        const check2 = ["address_line1", "address_line2", "district", "city_id", "postal_code", "phone"]
        for (var i of check1) {
            if (!body[i]) {
                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }
        for (var i of check2) {
            if (body.address[i] == null) {
                return res.type('json').status(400).send(JSON.stringify({ "error_msg": "missing data" }))
            }
        }

        let response = await query("SELECT email from customer WHERE email LIKE ?", [body.email])

        if (response.length !== 0) {
            return res.status(409).json({
                error_msg: "email already exist",
            });
        }

        await query("START TRANSACTION")
        let address_response = await user.addAddress(body.address)
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

app.get('/stocks/:id', async (req, res) => {
    try {
        const film_id = parseInt(req.params.id)
        const response = await query(`select inventory.store_id,inventory.film_id from inventory,rental,
        (select inventory_id,max(rental_date) as order_date
             from rental
             group by inventory_id) temp
          where rental.inventory_id=temp.inventory_id
          and rental.rental_date=temp.order_date
          and inventory.inventory_id = rental.inventory_id
          and inventory.film_id = ?
          and rental.return_date < CURRENT_DATE();`, [film_id])
        res.status(200).json(response)
    } catch (error) {
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

app.get('/stores', async (req, res) => {
    try {
        const response = await query("SELECT s.store_id,a.address,a.address2,a.district,a.postal_code,a.phone FROM store s,address a WHERE s.address_id = a.address_id")
        return res.status(200).json(response)
    } catch (error) {
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

    try {


        const response = await user.verify(req.body.email, req.body.password)
        if (response.length == 0) {
            return res.status(401).send()
        }

        const payload = { user_id: response[0].staff_id };
        jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "24h" }, (error,
            token) => {
            if (error) {
                res.status(401).send();
                return;
            }
            res.status(200).send({
                token: token,
                user_id: response[0].staff_id,
                expires: "2"
            });
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json(err_msg)
    }
});

export default app