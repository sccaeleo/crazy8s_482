// Backend Stuff

// Import Dependencies
const express = require('express')
const app = express()
const {db} = require('./firebase.js')
const cors = require("cors");
var mysql = require('mysql');
var path = require('path');

// Import Classes
const Game = require('../classes/Game.js')
const Player = require('../classes/Player.js')
const Deck = require('../classes/Deck.js')
const Card = require('../classes/Card.js')

// Port number, is flexible
const port = 5000

// Middleware functions for express
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// Connect to MySql


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

app.post("/edit_account/:id", (req, res) => {
  const id = req.params.id;
  const sql ="UPDATE account_information SET `name`=?, `email`=?, `password`=? WHERE id=?";
  const values = [
    req.body.name,
    req.body.email,
    req.body.password,
    id
  ];
  db.query(sql, values, (err, result) => {
    if (err)
      return res.json({ message: "Something unexpected has occured" + err });
    return res.json({ success: "Student updated successfully" });
  });
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM account_information WHERE id=?";
  const values = [id];
  db.query(sql, values, (err, result) => {
    if (err)
      return res.json({ message: "Something unexpected has occured" + err });
    return res.json({ success: "Student updated successfully" });
  });
});

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});

// ---------------------------------------- Socket ----------------------------------------

var games = [];

function createNewGame(host, room) {
  //const g = new Game(host, room, 10, '');
  const g = new Game(host);
  games.push(g);
  return g;
}

const io = require('socket.io')(3030, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})

io.on("connection", socket => {
  // var currGame;
  // var player;
  console.log('Connected ' + socket.id);

  socket.on("test", data => {
    console.log(data);
  })

  socket.on("createGame", room => {
    //socket.join(room)
    //socket.gameId = 1
    socket.player = new Player();
    const game = createNewGame(socket.player, room);
    socket.currGame = game;
    games.push(game);
  })

  socket.on("startGame", (cb) => {
    socket.currGame.startGame();
    //socket.player = socket.currGame.players[socket.gameId-1]
    io.emit("updatePile", socket.currGame.getTopCard());
    cb(socket.player.displayCards());
  })

  socket.on("playCard", (index, cb) => {
    // const played = socket.currGame.turn(socket.player, index)
    const played = socket.currGame.playCard(socket.player, index);
    if(played)
      io.emit("updatePile", socket.currGame.getTopCard());
    cb(played);
  })

  socket.on("drawCard", (cb) => {
    const card = socket.currGame.drawCard(socket.player);
    cb(card);
  })

  socket.on("pickSuit", suit => {
    const suitCard = socket.currGame.updateSuit();
    io.emit("updatePile", suitCard);
  })
})