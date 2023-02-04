//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865
import connection from "./databaseConfig.js"
import util from "util"
var query = util.promisify(connection.query).bind(connection);


const user = {
    //Endpoint 1
    get_actor: (actor_id) => {
        return query(
            "SELECT actor_id,first_name,last_name FROM actor WHERE actor_id = ?",
            [actor_id]
        )
    },
    //endpoint 2
    get_actors: (limit, offset) => {
        return query("SELECT actor_id,first_name,last_name FROM actor ORDER BY first_name ASC LIMIT ? OFFSET ?",
            [limit, offset]
        )
    },
    //endpoint 3
    new_actor: (first_name, last_name) => {
        return query(`INSERT into actor (first_name,last_name) VALUES (?,?)`,
            [first_name, last_name]
        )
    },
    //endpoint 4
    update_actor: (actor, id) => {
        return query("UPDATE actor SET first_name = IFNull(?,first_name),last_name = IFNull(?,last_name) WHERE actor_id = ?",
            [actor.first_name, actor.last_name, id]
        )
    },
    //endpoint 5
    delete_film_actor: (id) => {
        return query("DELETE FROM film_actor WHERE actor_id = ?", [id])
    },

    delete_actor: (id) => {
        return query("DELETE FROM actor WHERE actor_id = ?", [id])
    },
    //enmdpoint 6
    get_films: (limit, offset, max, search, id) => {

        return query("SELECT film.film_id, film.title, category.name as category, film.rating, film.release_year, film.length as duration from film join film_category on film_category.film_id=film.film_id join category on category.category_id=film_category.category_id  WHERE category.category_id =? AND film.title LIKE ? AND (? IS NULL OR film.rental_rate < ?) LIMIT ? OFFSET ?;",
            [id, "%" + search + "%", max, max, limit, offset]
        )
    },
    //endpoint 7
    get_payment: (id, start, end) => {
        return query(`
        SELECT film.title,payment.amount,DATE_FORMAT(payment.payment_date, "%Y-%m-%d %T") as payment_date
        FROM payment
        INNER JOIN rental ON payment.rental_id = rental.rental_id
        INNER JOIN inventory ON rental.inventory_id = inventory.inventory_id
        INNER JOIN film ON inventory.film_id = film.film_id
        WHERE payment.customer_id = ? AND payment.payment_date BETWEEN ? AND ?;
        `, [id, start, end])
    },
    //endpoint 8
    addAddress: (address) => {
        return query('INSERT into address(address,address2,district,city_id,postal_code,phone) VALUES (?,?,?,?,?,?)',
            [address.address_line1,
            address.address_line2,
            address.district,
            address.city_id,
            address.postal_code,
            address.phone])
    },

    addCustomer: (body) => {
        return query('INSERT INTO customer(store_id,first_name,last_name,email,address_id) VALUES (?,?,?,?,LAST_INSERT_ID())', [
            body.store_id,
            body.first_name,
            body.last_name,
            body.email])
    },


    //Two additional endpoints

    //Endpoint 9
    getStock: (film_id, store_id) => {
        return query(`select inventory.store_id,inventory.film_id,rental.* from inventory,rental,
        (select inventory_id,max(rental_date) as order_date
             from rental
             group by inventory_id) temp
          where rental.inventory_id=temp.inventory_id
          and rental.rental_date=temp.order_date
          and inventory.inventory_id = rental.inventory_id
          and inventory.film_id = ?
          and inventory.store_id = ?
          and rental.return_date < CURRENT_DATE();`, [film_id, store_id])
    },

    addRent: (invID, body) => {
        let date = new Date()
        date.setHours(date.getHours() + 8)
        return query("INSERT INTO rental (rental_date,inventory_id,customer_id,staff_id) VALUES (?,?,?,?)", [date.toISOString().slice(0, 19).replace('T', ' '), invID, body.customer_id, body.staff_id])
    },

    addPayment: (ID, body) => {


        let date = new Date()
        date.setHours(date.getHours() + 8)
        return query("INSERT INTO payment (customer_id,staff_id,rental_id,amount,payment_date) VALUES (?,?,?,?,?)", [body.customer_id, body.staff_id, ID, body.amount, date.toISOString().slice(0, 19).replace('T', ' ')])
    },


    //endpoint 10

    new_staff: (body, addressID) => {
        return query('INSERT INTO staff(first_name,last_name,address_id,email,store_id,active,username,password) VALUES (?,?,?,?,?,1,?,SHA1(?))', [
            body.first_name,
            body.last_name,
            addressID,
            body.email,
            body.store_id,
            body.username,
            body.password])
    },
    //Login
    verify: function (email, password) {
        return query("SELECT * FROM staff WHERE email = ? AND password = sha1(?)", [email, password])
    }
}

export default user

