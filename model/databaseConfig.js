//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865
var mysql = require('mysql')

var dbconnect = {
    getConnection: function () {
        var conn = mysql.createConnection({
            host: "localhost",
            user: "bed_dvd_root",
            password: "pa$$woRD123",
            database: "bed_dvd_db",
            // multipleStatements:true
        })
        return conn
    }
};

//For use when coding on desktop

// var dbconnect = {
//     getConnection: function () {
//         var conn = mysql.createConnection({
//             host: "192.168.1.35",
//             user: "DesktopRoot",
//             password: "root",
//             database: "bed_dvd_db"
//         })
//         return conn
//     }
// };




module.exports = dbconnect