// P2205865
// Leong Yu Zhi Andy
// DIT/FT/1B/02
const express = require("express");
const app = express();
app.get("/", (req, res) => {
    res.sendFile("/public/index.html", { root: __dirname });
});
app.get("/users/:id", (req, res) => {
    res.sendFile("/public/user.html", { root: __dirname });
});
app.get("/users/", (req, res) => {
    res.sendFile("/public/users.html", { root: __dirname });
});

app.get("/stores", (req, res) => {
    res.sendFile("/public/stores.html", { root: __dirname })
})

app.get("/films/:id", (req, res) => {
    res.sendFile("/public/films.html", { root: __dirname })
})

app.get("/admin",(req,res)=>{
    res.sendFile("/public/admin-main.html", { root: __dirname })
})
app.get("/admin/editActor",(req,res)=>{
    res.sendFile("/public/admin-editActor.html", { root: __dirname })
})
app.get("/admin/editFilm",(req,res)=>{
    res.sendFile("/public/admin-editFilm.html", { root: __dirname })
})

app.get("/admin/addCustomer",(req,res)=>{
    res.sendFile("/public/admin-addCustomer.html", { root: __dirname })
})

app.get("/admin/editCustomer",(req,res)=>{
    res.sendFile("/public/admin-editCustomer.html", { root: __dirname })
})

app.get("/admin/deleteCustomer",(req,res)=>{
    res.sendFile("/public/admin-deleteCustomer.html", { root: __dirname })
})

app.get("/admin/deleteActor",(req,res)=>{
    res.sendFile("/public/admin-deleteActor.html", { root: __dirname })
})

app.get("/admin/deleteFilm",(req,res)=>{
    res.sendFile("/public/admin-deleteFilm.html", { root: __dirname })
})

app.get("/admin/addFilm",(req,res)=>{
    res.sendFile("/public/admin-addFilm.html", { root: __dirname })
})

app.get("/admin/addActor",(req,res)=>{
    res.sendFile("/public/admin-addActor.html", { root: __dirname })
})

app.get("/login/", (req, res) => {
    res.sendFile("/public/login.html", { root: __dirname });
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Client server has started listening on port ${PORT}`);
});