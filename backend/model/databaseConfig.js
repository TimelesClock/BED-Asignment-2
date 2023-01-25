//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865
import mysql from 'mysql2'

let connection

try {
    connection = mysql.createConnection({
        host: "localhost",
        user: "bed_dvd_root",
        password: "pa$$woRD123",
        database: "bed_dvd_db",
    })
} catch (error) {
    console.log(error)
}






export default connection