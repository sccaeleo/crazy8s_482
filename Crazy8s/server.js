// Backend Stuff

// Import Dependencies
const express = require('express')
const app = express()
const cors = require("cors");
var mysql = require('mysql');
var path = require('path');

// Port number, is flexible
const port = 3000

// Middleware functions for express
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Connect to MySql
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
});

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});
