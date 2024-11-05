// Backend Stuff

// Import Dependencies
const express = require('express')
const app = express()
const {db} = require('./firebase.js')
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



app.post("/add_user", (req, res) => {
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

var games = []

function createNewGame(host, room) {
  const g = new Game(host, room, 10, '');
  games.push(g)
  return g
}

const io = require('socket.io')(3030, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})

io.on("connection", socket => {
  // var currGame;
  // var player;
  console.log('Connected ' + socket.id)

  socket.on("test", data => {
    console.log(data);
  })

  socket.on("createGame", room => {
    //socket.join(room)
    socket.gameId = 1
    const game = createNewGame(1, room)
    socket.currGame = game
    games.push(game)
  })

  socket.on("startGame", (cb) => {
    socket.currGame.startGame();
    socket.player = socket.currGame.players[socket.gameId-1]
    cb(socket.player.displayCards());
  })

  socket.on("playCard", (index, cb) => {
    const played = socket.currGame.turn(socket.player, index)
    cb(played)
  })

  socket.on("drawCard", (cb) => {
    const card = socket.currGame.drawCard(socket.player)
    cb(card)
  })

  socket.on("listGames", (cb) => {
    cb(games)
  })

  socket.on("joinGame", (cb) => {
    // yeah
  })

})




// ---------------------------------------- Classes ----------------------------------------
// For time purposes classes are in this file. Next sprint we will figure out how to import

class Game {

  //establish vars
  deck;
  pile = [];
  players = [];
  bet;
  password;
  host;
  room;
  currTurn;
  isPublic;

  //initialize a deck, add the host and set room settings
  constructor(host, room, bet, password) {
      this.deck = new Deck();
      this.host = host;
      this.players.push(new Player(1));
      this.bet = bet;
      this.password = password;
      this.room = room;

      if (password.length == 0){
        this.isPublic = true;
      } else {
        this.isPublic = false;
      }
  }


  //player joins a game
  addPlayer(user) {
      size = this.players.length;

      //check if there is room in the lobby
      if(size < 4) {
          this.players.push(new Player(size+1, user));
          return true;
      }else{
          return false;
      }
  }

  //deal, pick the first player and then give first player a turn
  startGame() {
      this.deal();
      // this.currTurn = this.getFirstPlayer();
      this.currTurn = 1;
      this.pile.push(this.deck.drawCard());
  }

  //get a random integer 0-3 for index of a player
  getFirstPlayer() {
      var random = Math.random()*4;
      return Math.floor(random);
  }

  //give each player 5 cards
  deal() {
      for(var i = 0; i < 5; i++) {
          for(const player of this.players) {
              const card = this.deck.drawCard();
              player.drawCard(card);
          }
      }
  }

  getPlayer(gameId) {
    return this.players[gameId-1]
  }

  turn(player, index) {
    if(this.currTurn == player.playerId) {
      console.log("if complete")
      // bad practice since low on time will be fixed
      const card = player.hand[index]
      const played = player.playCard(index, this.pile[this.pile.length-1])
      if(played) {
        this.pile.push(card)
        return true;
      }
    }
    return false;
  }

  drawCard(player) {
    const newCard = this.deck.drawCard()
    player.drawCard(newCard)
    return newCard.getStringPNG()
  }

  endGame(winner) {

  }
}

class Player {

  hand = [];
  playerId;
  user;

  constructor(id) {
      this.playerId = id;
      //this.user = user;
  }

  //This will be called Client side, when picking a card
  playCard(cardIndex, pileCard) {
      const card = this.hand[cardIndex];

      // is the card playable?
      if(this.hand[cardIndex].compare(pileCard)) {
        const r1 = this.hand.splice(cardIndex, 1);
        return true;
      }else{
        return false;
      }
  }

  //draw a card
  drawCard(card) {
      this.hand.push(card);
  }

  //check if won
  isEmpty() {
      return this.hand.length == 0;
  }

  displayCards() {
    const pngs = []
    for(const card of this.hand) {
      const png = card.getStringPNG()
      pngs.push(png)
    }
    return pngs
  }
}

class Deck {

  //suits and ranks to easily create the deck
  suits = ['Clubs','Diamonds','Hearts','Spades'];
  ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  cards = [];

  constructor() {
      //for each suit and rank make a card
      for(const suit of this.suits)
          for(const rank of this.ranks)
              this.cards.push(new Card(suit, rank));
  }

  shuffle()
  {
      //for each card swap it with a random card in the deck
      for(var i = 0; i < 52; i++) {
          var newIndex = Math.random()*52;
          
          let temp = this.cards[i];
          this.cards[i] = this.cards[newIndex];
          this.cards[newIndex] = temp;
      }
  }

  drawCard() {
    const info = this.cards.pop()
    return info
  }

  isEmpty() {
      return this.cards.length == 0;
  }

  printCards() {
    for(const card of this.cards)
      console.log(card.getStringPNG())
  }
}

class Card {

  suit;
  rank;

  constructor(suit, rank)
  {
      this.suit = suit;
      this.rank = rank;
  }

  //check if playable
  checkSuitRank(suit, rank)
  {
      if(this.suit == suit)
          return true;
      if(this.rank == rank)
          return true;
      return false;
  }

  //compare to another card to see if playable
  compare(other)
  {
      if(this.rank == '8')
        return true
      return other.checkSuitRank(this.suit, this.rank);
  }

  getStringPNG() {
      return "card" + this.suit + this.rank + ".png";
  }
}