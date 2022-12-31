var db = require('./databaseConfig.js')

var userDB = {
    get_actor: (actor_id, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                console.log(err)
                return callback(err, null)
            } else {
                const sql = "SELECT actor_id,first_name,last_name FROM actor WHERE actor_id = ?"
                conn.query(sql, [actor_id], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else if (results.length === 0) {
                        return callback(null, null)
                    } else {
                        return callback(null, results)
                    }
                })
            }

        })


    },

    get_actors: (limit, offset, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                console.log(err)
                return callback(err, null)
            } else {
                const sql = "SELECT actor_id,first_name,last_name FROM actor ORDER BY first_name ASC LIMIT ? OFFSET ?"
                conn.query(sql, [limit, offset], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, results)
                    }
                })
            }
        })
    },

    new_actor: (actor, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                if (!actor.first_name || !actor.last_name) {
                    return callback(null, null)
                }
                const sql = `INSERT into actor (first_name,last_name) VALUES (?,?)`
                conn.query(sql, [actor.first_name, actor.last_name], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, results.insertId)
                    }
                })
            }
        })
    },

    update_actor: (actor, id, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                const sql = "UPDATE actor SET first_name = IFNull(?,first_name),last_name = IFNull(?,last_name) WHERE actor_id = ?"
                conn.query(sql, [actor.first_name, actor.last_name, id], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, results)
                    }
                })
            }
        })
    },

    delete_actor: (id, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                conn.query('BEGIN', (error, result) => {
                    if (error) {
                        conn.end()
                        return callback(error, null)
                    }
                    conn.query('DELETE FROM film_actor WHERE actor_id = ?',
                        [id],
                        (error, result) => {
                            if (error) {
                                conn.end()
                                return callback(error, null)
                            }
                            conn.query('DELETE FROM actor WHERE actor_id = ?', [id], (error, result) => {
                                if (error) {
                                    conn.end()
                                    return callback(error, null)
                                }
                                var end = result
                                conn.query('COMMIT', (error, result) => {
                                    if (error) {
                                        conn.end()
                                        return callback(error, null)
                                    }
                                    conn.end()
                                    return callback(null, end.affectedRows)
                                })
                            })
                        })
                })
            }
        })
    },

    get_films: (id, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                const sql = `SELECT f.film_id,f.title,c.name AS category,f.rating,f.release_year,f.length AS duration FROM film f,film_category fc,category c WHERE  fc.category_id = c.category_id AND fc.film_id = f.film_id AND c.category_id = ?;`
                conn.query(sql, [id], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, results)
                    }
                })
            }
        })
    },

    get_payment: (id, start, end, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                const sql =
                    `
                SELECT film.title,payment.amount,payment.payment_date
                FROM payment
                INNER JOIN rental ON payment.rental_id = rental.rental_id
                INNER JOIN inventory ON rental.inventory_id = inventory.inventory_id
                INNER JOIN film ON inventory.film_id = film.film_id
                WHERE payment.customer_id = ? AND payment.payment_date BETWEEN ? AND ?;
                `
                conn.query(sql, [id, start, end], (error, results) => {
                    conn.end()
                    if (error) {
                        return callback(error, null)
                    } else {
                        return callback(null, results)
                    }
                })
            }
        })
    },

    new_customer: (body, address, callback) => {
        var conn = db.getConnection()
        conn.connect((err) => {
            if (err) {
                return callback(err, null)
            } else {
                conn.query('BEGIN', (error, result) => {
                    if (error) {
                        conn.end()
                        return callback(error, null)
                    }
                    conn.query('INSERT into address(address,address2,district,city_id,postal_code,phone) VALUES (?,?,?,?,?,?)',
                        [address.address_line1,
                        address.address_line2,
                        address.district,
                        address.city_id,
                        address.postal_code,
                        address.phone],
                        (error, result) => {
                            if (error) {
                                conn.end()
                                return callback(error, null)
                            }
                            conn.query('INSERT INTO customer(store_id,first_name,last_name,email,address_id) VALUES (?,?,?,?,LAST_INSERT_ID())', [
                                body.store_id,
                                body.first_name,
                                body.last_name,
                                body.email
                            ], (error, result) => {
                                if (error) {
                                    conn.end()
                                    return callback(error, null)
                                }
                                var end = result
                                conn.query('COMMIT', (error, result) => {
                                    if (error) {
                                        conn.end()
                                        return callback(error, null)
                                    }
                                    conn.end()
                                    return callback(null, end.insertId)
                                })
                            })
                        })
                })
            }
        })
    },

    //Two additional endpoints

    //Endpoint 9

    rent:(body,callback)=>{
        var conn = db.getConnection()
        conn.connect(err=>{
            if(err){
                return callback(err,null)
            }else{

                conn.query("BEGIN",(error,result)=>{
                    if(error){
                        conn.end()
                        return callback(error,null)
                    }else{
                        const sql1 = `select inventory.store_id,inventory.film_id,rental.* from inventory,rental,
                        (select inventory_id,max(rental_date) as order_date
                             from rental
                             group by inventory_id) temp
                          where rental.inventory_id=temp.inventory_id
                          and rental.rental_date=temp.order_date
                          and inventory.inventory_id = rental.inventory_id
                          and inventory.film_id = ?
                          and inventory.store_id = ?
                          and rental.return_date < CURRENT_DATE();`
                        conn.query(sql1,[body.film_id,body.store_id],(error,result)=>{
                            //result.length will be the number of availble films for the given film id and store id
                            if(error){
                                conn.end()
                                return callback(error,null)
                            }
                            if (result == 0){
                                conn.end()
                                return callback("NO_STOCK",null)
                            }
                            conn.query("INSERT INTO rental (rental_date,inventory_id,customer_id,staff_id VALUES (CURRENT_TIMESTAMP,?,?,?)",[result[0].inventory_id,body.customer_id,body.staff_id],(error,result)=>{
                                if(error){
                                    conn.end()
                                    return callback(error,null)
                                }

                                conn.query("INSERT INTO payment (customer_id,staff_id,rental_id,amount,payment_date VALUES (?,?,?,?,CURRENT_TIMESTAMP))",[body.customer_id,body.staff_id,result.insertId,body.amount],(error,result)=>{
                                    if(error){
                                        conn.end()
                                        return callback(error,null)
                                    }

                                    var end = result.insertId

                                    conn.query("COMMIT",(error,result)=>{
                                        if(error){
                                            conn.end()
                                            return callback(error,null)
                                        }else{
                                            return callback(null,end)
                                        }
                                    })
                                })
                            })


                        })
                    }
                })
            }
        })
    }
}

module.exports = userDB

