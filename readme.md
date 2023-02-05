
// P2205865

// Leong Yu Zhi Andy

// DIT/FT/1B/02

1. Installation and Pre requisites

---

Ensure that Node.js is downloaded and installed ([https://nodejs.org/en/download/](https://nodejs.org/en/download/ "https://nodejs.org/en/download/"))


Next, ensure that the MYSQl database is running on the machine and there is

1. A Schema created named "bed_dvd_db" and the "sakila_modified.sql" file has been ran for the bed_dvd_db schema.
2. A MYSQL user named "bed_dvd_root" with the password "pa$$woRD123" and has DBA (Database Administrator) Access in the Administrative Roles

---

2. Running the server

---

Once step 1 has been completed you can proceed to run the server using

```bash
cd backend
npm install
nodemon server.js
```

And run the frontend server using

```bash
cd FrontEnd
npm install
nodemon server.js
```

If everything works, it should display

"App Hosted at [http://localhost:8081/](http://localhost:8081/ (back-end)) "http://localhost:8081/ (back-end)") and "Server hosted at [http://localhost:3001](http://localhost:3001/ (front=end)) "http://localhost:3001/ (front=end)")

---

3. Testing the server

---

Open the server on your Browser at l[http://localhost:3001/](http://localhost:3001/ "http://localhost:3001/")

Ensure that the server is running and it displays "Web App Hosted at [http://localhost:8081/](http://localhost:8081/ (back-end)) "http://localhost:8081/ (back-end)") and "Server hosted at [http://localhost:3001/ ](http://localhost:3001/ (front=end)) "http://localhost:3001/ (front=end)")
before testing the server on Postman/Browser
