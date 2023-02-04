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

app.get("/admin/addCustomer",(req,res)=>{
    res.sendFile("/public/admin-addCustomer.html", { root: __dirname })
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