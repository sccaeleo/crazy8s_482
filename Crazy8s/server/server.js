// Backend Stuff

// Import Dependencies
const express = require('express')
const app = express()
const cors = require("cors");
var mysql = require('mysql');
var path = require('path');

// Port number, is flexible
const port = 5000

// Middleware functions for express
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Connect to MySql
var db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "accounts"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.post("/add_user", (req, res) => {

    console.log(req.body)
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);        
    console.log('Button pressed');

    const sql ="INSERT INTO account_information (`name`,`email`,`password`) VALUES (?, ?, ?)";
    const values = [req.body.name, req.body.email, req.body.password];
    db.query(sql, values, (err, result) => {
      if (err)
        return res.json({ message: "Something unexpected has occured" + err });
      return res.json({ success: "user added successfully" });
    });
  });

app.get("/accounts", (req, res) => {
  const sql = "SELECT * FROM account_information";
  db.query(sql, (err, result) => {
    if (err) res.json({ message: "Server error" });
    return res.json(result);
  });
});

app.get("/get_account/:id", (req, res) => {
  console.log("im here")
  const id = req.params.id;
  const sql = "SELECT * FROM account_information WHERE `id`= ?";
  db.query(sql, [id], (err, result) => {
    if (err) res.json({ message: "Server error" });
    return res.json(result);
  });
});

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});

// ---------------------------------------- Socket ----------------------------------------


const io = require('socket.io')(3030, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})

io.on("connection", socket => {
  console.log('Connected ' + socket.id)

  socket.on("test", data => {
    console.log(data);
  })
})
