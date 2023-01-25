//Class: DIT/FT/1B/02
//Name: Leong Yu Zhi Andy
//Admission Number: P2205865
import app from './controller/app.js'
var port = 8081



var server = app.listen(port, function () {
    console.log('Web App Hosted at http://localhost:%s', port);
});