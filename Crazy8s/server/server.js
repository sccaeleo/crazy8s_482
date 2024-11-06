// Backend Stuff

// Import Dependencies
const express = require('express')
const crypto = require('crypto');
const session = require('express-session')
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

// set up permanent secret in .env as long term solution
const sessionSecret = crypto.randomBytes(32).toString('hex'); 

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 }
  })
);



app.post('/add_user', async (req, res) => {
    const { name, email, password } = req.body;
    //const usersRef = db.collection('users').doc(name);
    try {
      const newUserRef = await db.collection('users').add({
          email,
          name,
          password,
          friends:[],
          friend_requests:[],
          balance:0,
      });
        res.status(200).json({ success: 'user added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something unexpected has occurred' + err });
    }
});

app.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user); // Send the user info stored in the session
  } else {
    res.status(401).json({ message: 'Not authenticated' }); // No session found
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Retrieve user data from Firebase (assuming you have a "users" collection)
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).send('User not found');
    }

    const userData = userSnapshot.docs[0].data();

    // Here you would check if the password is correct
    if (userData.password !== password) {
      return res.status(401).send('Incorrect password');
    }

    // Save user details to the session after successful login
    req.session.user = {
      id: userSnapshot.docs[0].id,     // Firebase document ID
      name: userData.name,
      balance: userData.balance
    };

    res.send('User logged in and session started');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.send('User logged out');
  });
});



app.get('/accounts', async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



app.get('/get_user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(userDoc.data());
  } catch (err) {
      console.error('Error getting user:', err);
      res.status(500).json({ message: 'Server error' });
  }
});

app.post('/edit_user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { name, email, password } = req.body;
  try {
      await db.collection('users').doc(userId).update({
          name,
          email,
          password
      });
      res.status(200).json({ success: 'User updated successfully' });
  } catch (err) {
      res.status(500).json({ message: 'Something unexpected has occurred' + err });
  }
});

app.delete('/delete_user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      await db.collection('users').doc(userId).delete();
      res.status(200).json({ success: 'User deleted successfully' });
  } catch (err) {
      res.status(500).json({ message: 'Something unexpected has occurred' + err });
  }
});

app.post('/add_friend/:userID', async(req, res) => {
  const userId = req.params.userId;
  const friend = req.body;
  try{
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      friend_requests: firebase.firestore.FieldValue.arrayUnion(
      db.collection('users').doc(friend)
    )
    
    });
    res.status(200).json({ success: 'Friend request sent' });

  } catch (err) {
    res.status(500).json({ message: 'Something unexpected has occurred' + err });
  }
});

app.post('/accept_friend/:userID', async(req, res) => {
  const userId = req.params.userId;
  const friend = req.body;
  try{
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      friends: firebase.firestore.FieldValue.arrayUnion(
      db.collection('users').doc(friend)
    )
    
    });
    res.status(200).json({ success: 'Friend added successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Something unexpected has occurred' + err });
  }
});

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});

// ---------------------------------------- Socket ----------------------------------------

var games = [];

function createNewGame(host, roomName, bet, password, isPublic) {
  const game = new Game(host, roomName, bet, password, isPublic);
  games.push(game);
  return game;
}

const io = require('socket.io')(3030, {
  cors: {
    // origin: ['http://localhost:3000'],
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http//localhost:3003','http://localhost:3004'];

      // Check if the origin of the request is allowed
      if (allowedOrigins.includes(origin)) {
        callback(null, true);  // Allow the connection
      } else {
        callback(new Error('Not allowed by CORS'));  // Reject the connection
      }
    },
  },
})

io.on("connection", socket => {
  console.log('Connected ' + socket.id);

  socket.on("test", data => {
    console.log(data);
  })

  socket.on("createGame", (data) => {
    socket.player = new Player();
    const { roomName, bet, password, isPublic } = data;
    const game = createNewGame(socket.player, roomName, bet, password, isPublic);
    socket.currGame = game;
  })

  socket.on("startGame", (cb) => {
    socket.currGame.startGame();
    io.emit("updatePile", socket.currGame.getTopCard());
    cb(socket.player.displayCards());
  })

  socket.on("playCard", (index, cb) => {
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
    const suitCard = socket.currGame.updateSuit(suit);
    io.emit("updatePile", suitCard);
  })

  socket.on("listGames", (cb) => {
    cb(games);
  })

  socket.on("joinGame", (cb) => {
    // yeah
  })

})




// ---------------------------------------- Classes ----------------------------------------
// For time purposes classes are in this file. Next sprint we will figure out how to import

// class Game {

//   //establish vars
//   deck;
//   pile = [];
//   players = [];
//   bet;
//   password;
//   host;
//   room;
//   currTurn;
//   isPublic;

//   //initialize a deck, add the host and set room settings
//   constructor(host, room, bet, password, isPublic) {
//       this.deck = new Deck();
//       this.host = host;
//       this.players.push(new Player(1));
//       this.bet = bet;
//       this.password = password;
//       this.room = room;
//       this.isPublic = isPublic;
//   }


//   //player joins a game
//   addPlayer(user) {
//       size = this.players.length;

//       //check if there is room in the lobby
//       if(size < 4) {
//           this.players.push(new Player(size+1, user));
//           return true;
//       }else{
//           return false;
//       }
//   }

//   //deal, pick the first player and then give first player a turn
//   startGame() {
//       this.deal();
//       // this.currTurn = this.getFirstPlayer();
//       this.currTurn = 1;
//       this.pile.push(this.deck.drawCard());
//   }

//   //get a random integer 0-3 for index of a player
//   getFirstPlayer() {
//       var random = Math.random()*4;
//       return Math.floor(random);
//   }

//   //give each player 5 cards
//   deal() {
//       for(var i = 0; i < 5; i++) {
//           for(const player of this.players) {
//               const card = this.deck.drawCard();
//               player.drawCard(card);
//           }
//       }
//   }

//   getPlayer(gameId) {
//     return this.players[gameId-1]
//   }

//   turn(player, index) {
//     if(this.currTurn == player.playerId) {
//       console.log("if complete")
//       // bad practice since low on time will be fixed
//       const card = player.hand[index]
//       const played = player.playCard(index, this.pile[this.pile.length-1])
//       if(played) {
//         this.pile.push(card)
//         return true;
//       }
//     }
//     return false;
//   }

//   drawCard(player) {
//     const newCard = this.deck.drawCard()
//     player.drawCard(newCard)
//     return newCard.getStringPNG()
//   }

//   endGame(winner) {

//   }
// }

// class Player {

//   hand = [];
//   playerId;
//   user;

//   constructor(id) {
//       this.playerId = id;
//       //this.user = user;
//   }

//   //This will be called Client side, when picking a card
//   playCard(cardIndex, pileCard) {
//       const card = this.hand[cardIndex];

//       // is the card playable?
//       if(this.hand[cardIndex].compare(pileCard)) {
//         const r1 = this.hand.splice(cardIndex, 1);
//         return true;
//       }else{
//         return false;
//       }
//   }

//   //draw a card
//   drawCard(card) {
//       this.hand.push(card);
//   }

//   //check if won
//   isEmpty() {
//       return this.hand.length == 0;
//   }

//   displayCards() {
//     const pngs = []
//     for(const card of this.hand) {
//       const png = card.getStringPNG()
//       pngs.push(png)
//     }
//     return pngs
//   }
// }

// class Deck {

//   //suits and ranks to easily create the deck
//   suits = ['Clubs','Diamonds','Hearts','Spades'];
//   ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
//   cards = [];

//   constructor() {
//       //for each suit and rank make a card
//       for(const suit of this.suits)
//           for(const rank of this.ranks)
//               this.cards.push(new Card(suit, rank));
//   }

//   shuffle()
//   {
//       //for each card swap it with a random card in the deck
//       for(var i = 0; i < 52; i++) {
//           var newIndex = Math.random()*52;
          
//           let temp = this.cards[i];
//           this.cards[i] = this.cards[newIndex];
//           this.cards[newIndex] = temp;
//       }
//   }

//   drawCard() {
//     const info = this.cards.pop()
//     return info
//   }

//   isEmpty() {
//       return this.cards.length == 0;
//   }

//   printCards() {
//     for(const card of this.cards)
//       console.log(card.getStringPNG())
//   }
// }

// class Card {

//   suit;
//   rank;

//   constructor(suit, rank)
//   {
//       this.suit = suit;
//       this.rank = rank;
//   }

//   //check if playable
//   checkSuitRank(suit, rank)
//   {
//       if(this.suit == suit)
//           return true;
//       if(this.rank == rank)
//           return true;
//       return false;
//   }

//   //compare to another card to see if playable
//   compare(other)
//   {
//       if(this.rank == '8')
//         return true
//       return other.checkSuitRank(this.suit, this.rank);
//   }

//   getStringPNG() {
//       return "card" + this.suit + this.rank + ".png";
//   }
// }
