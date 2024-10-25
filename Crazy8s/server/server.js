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
      return res.json({ success: "Student added successfully" });
    });
  });

  app.get("/accounts", (req, res) => {
    const sql = "SELECT * FROM account_information";
    db.query(sql, (err, result) => {
      if (err) res.json({ message: "Server error" });
      return res.json(result);
    });
  });

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});

// ---------------------------------------- Socket ----------------------------------------

var games = []

const io = require('socket.io')(3030, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})

io.on("connection", socket => {
  var currGame;
  var player;
  console.log('Connected ' + socket.id)

  socket.on("test", data => {
    console.log(data);
  })

  socket.on("createGame", room => {
    socket.join(room)
    player = new Player()
    currGame = createNewGame(player, room)
    console.log("WE DID IT")
  })

  socket.on("startGame", game => {
    currGame.startGame();
    console.log("Game Started: " + player.displayCards)
  })
})

function createNewGame(host, room) {
  games.push(new Game(host, room))
}




// ---------------------------------------- Classes ----------------------------------------

class Game {

  //establish vars
  #deck;
  #pile = [];
  #players = [];
  #bet;
  #password;
  #host;
  #room;

  //initialize a deck, add the host and set room settings
  constructor(host, room, bet, password) {
      this.#deck = new Deck();
      this.#host = host;
      this.#players.push(this.#host);
      this.#bet = bet;
      this.#password = password;
      this.#room = room;
  }

  //player joins a game
  addPlayer(user) {
      size = this.#players.length;

      //check if there is room in the lobby
      if(size < 4) {
          this.#players.push(new Player(size+1, user));
          return true;
      }else{
          return false;
      }
  }

  //deal, pick the first player and then give first player a turn
  startGame() {
      this.deal();
      var firstPlayer = this.#getFirstPlayer();
      this.turn(firstPlayer);
      this.#pile = deck.drawCard();
  }

  //get a random integer 0-3 for index of a player
  #getFirstPlayer() {
      var random = Math.random()*4;
      return Math.floor(random);
  }

  //give each player 5 cards
  deal() {
      for(var i = 0; i < 5; i++) {
          for(player of this.#players) {
              card = this.#deck.drawCard();
              player.drawCard(card);
          }
      }
  }

  turn(player) {

  }

  endGame(winner) {

  }
}

class Player {

  #hand = [];
  #playerId;
  #user;

  constructor(id, user) {
      this.#playerId = id;
      this.#user = user;
  }

  //This will be called Client side, when picking a card
  playCard(cardIndex) {
      r1 = this.#hand.splice(cardIndex, 1);
  }

  //draw a card
  drawCard(card) {
      this.#hand.push(card);
  }

  //check if won
  isEmpty() {
      return this.#hand.length == 0;
  }

  displayCards() {
      console.log(this.#hand)
  }
}

class Deck {

  //suits and ranks to easily create the deck
  #suits = ['Clubs','Diamonds','Hearts','Spades'];
  #ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  #cards = [];

  constructor() {
      //for each suit and rank make a card
      for(const suit of this.#suits)
          for(const rank of this.#ranks)
              this.#cards.push(new Card(suit, rank));
  }

  shuffle()
  {
      //for each card swap it with a random card in the deck
      for(var i = 0; i < 52; i++) {
          var newIndex = Math.random()*52;
          
          let temp = this.#cards[i];
          this.#cards[i] = this.#cards[newIndex];
          this.#cards[newIndex] = temp;
      }
  }

  drawCard() {
      return this.#cards.pop();
  }

  isEmpty() {
      return this.#cards.length == 0;
  }
}

class Card {

  #suit;
  #rank;

  constructor(suit, rank)
  {
      this.#suit = suit;
      this.#rank = rank;
  }

  //check if playable
  checkSuitRank(suit, rank)
  {
      if(this.#suit == suit)
          return true;
      if(this.#rank == rank)
          return true;
      return false;
  }

  //compare to another card to see if playable
  compare(other)
  {
      return other.checkSuitRank(this.#suit, this.#rank);
  }

  toString() {
      return "card" + this.#suit + "-" + this.#rank;
  }
}