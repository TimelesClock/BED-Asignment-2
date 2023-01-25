1. Installation and Pre requisites
-------------------------------------------------------
Ensure that Node.js is downloaded and installed (https://nodejs.org/en/download/)

CD on the windows/mac terminal to the directory this readme.txt is stored in and run 

>> npm install
>> npm install mysql

to install the program's dependencies, mainly mysql and express.js

Next, ensure that the MYSQl database is running on the machine and there is

1. A Schema created named "bed_dvd_db" and the "sakila_bed.sql" file has been ran for the bed_dvd_db schema.
2. A MYSQL user named "bed_dvd_root" with the password "pa$$woRD123" and has DBA (Database Administrator) Access in the Administrative Roles


-------------------------------------------------------
2. Running the server
-------------------------------------------------------

Once step 1 has been completed you can proceed to run the server using

>> node server.js

If everything works, it should display 

"Web App Hosted at http://localhost:8081"

-------------------------------------------------------
3. Testing the server endpoints
-------------------------------------------------------

Currently the server has 8 endpoints, being:

1. GET /actors/:actor_id
2. GET /actors?limit=&offset=
3. POST /actors
4. PUT /actors/:actor_id
5. DELETE /actors/:actor_id
6. GET /film_categories/:category_id/films
7. GET /customer/:customer_id/payment
8. POST /customers

With 2 additional endpoints being
9. POST /rental
10. POST /staff


Ensure that the server is running and it displays "Web App Hosted at http://localhost:8081"
before testing the endpoints on PostMan


Postman link for the endpoints, Sign in to postman and fork the collection.
https://www.postman.com/timelesclock/workspace/bed-assignment-1/collection/24074599-477b3413-fa47-4b52-a162-87c012ffbfbc?action=share&creator=24074599