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
}

module.exports = userDB

