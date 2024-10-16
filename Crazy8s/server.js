// Backend server side components

// Port
const port = 3000

// Instantiante Express
const express = require('express')
const app = express()

// Instantiate MySql
var mysql = require('mysql');

// Path module from NodeJS
var path = require('path');

// Create http Server
var server = require('http').createServer(app).listen(port);

// Instantiate socketio
var io = require('socket.io').listen(server);


// Connect to MySql
var con = mysql.createConnection({
    host: "localhost",
    user: "yourusername",
    password: "yourpassword"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE mydb", function (err, result) {
        if (err) throw err;
        console.log("Database created");
    });
});
