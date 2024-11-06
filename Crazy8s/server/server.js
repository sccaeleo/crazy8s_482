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



// app.post("/add_user", (req, res) => {
//     const sql ="INSERT INTO account_information (`name`,`email`,`password`) VALUES (?, ?, ?)";
//     const values = [req.body.name, req.body.email, req.body.password];
//     db.query(sql, values, (err, result) => {
//       if (err)
//         return res.json({ message: "Something unexpected has occured" + err });
//       return res.json({ success: "user added successfully" });
//     });
//   });

app.post('/add_user', async (req, res) => {
    const { name, email, password } = req.body;
    //const usersRef = db.collection('users').doc(name);
    try {
      const newUserRef = await db.collection('users').add({
          email,
          name,
          password
      });
        res.status(200).json({ success: 'user added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something unexpected has occurred' + err });
    }
});  

// app.get("/accounts", (req, res) => {
//   const sql = "SELECT * FROM account_information";
//   db.query(sql, (err, result) => {
//     if (err) res.json({ message: "Server error" });
//     return res.json(result);
//   });
// });

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

// app.get("/get_account/:id", (req, res) => {
//   console.log("im here")
//   const id = req.params.id;
//   const sql = "SELECT * FROM account_information WHERE `id`= ?";
//   db.query(sql, [id], (err, result) => {
//     if (err) res.json({ message: "Server error" });
//     return res.json(result);
//   });
// });

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

app.listen(port, () => {
    console.log(`listening on port ${port} `);
});

// ---------------------------------------- Socket ----------------------------------------

var games = [];

/**
 * Create a new Game
 * @param {Player} host 
 * @param {string} roomName 
 * @param {number} bet 
 * @param {string} password 
 * @param {boolean} isPublic 
 * @returns {game} - the game created
 */
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

/**
 * On socket connection, listen for these functions
 */
io.on("connection", socket => {
  console.log('Connected ' + socket.id);

  /**
   * Prints the data passed to it
   * For Testing Purposes
   * @param {*} data - value to be printed
   */
  socket.on("test", data => {
    console.log(data);
  })

  /**
   * Create a new Game
   * @param {*} data - game information
   */
  socket.on("createGame", (data) => {
    socket.player = new Player();
    const { room, bet, password, isPublic } = data;
    const game = createNewGame(socket.player, room, bet, password, isPublic);
    socket.currGame = game;
    socket.join(room);
    socket.gameRoom = room;
  })

  /**
   * Start your game.
   * @returns {string[]} - a list of your cards png files as strings
   */
  socket.on("startGame", (cb) => {
    socket.currGame.startGame();
    io.to(socket.gameRoom).emit("updatePile", socket.currGame.getTopCard());
    socket.to(socket.gameRoom).emit("requestHand");
    cb(socket.player.displayCards());
  })

  /**
   * Asks for players hand.
   * @returns {string[]} - a list of your cards png files as strings
   */
  socket.on("getHand", cb => {
    console.log("Got Hand");
    cb(socket.player.displayCards());
  })

  /**
   * Play a card.
   * @param {number} index - the index of the card to play
   * @returns {boolean} - true if played, false if not
   */
  socket.on("playCard", (index, cb) => {
    const played = socket.currGame.playCard(socket.player, index);
    if(played) {
      console.log(socket.currGame.getTopCard());
      io.to(socket.gameRoom).emit("updatePile", socket.currGame.getTopCard());
      //socket.to(socket.gameRoom).emit("updatePlayerCards", );
    }
    cb(played);
  })

  /**
   * Draw a card.
   * @returns {string} - the png file to your card
   */
  socket.on("drawCard", (cb) => {
    const card = socket.currGame.drawCard(socket.player);
    cb(card);
  })

  /**
   * Pick the suit after playing an 8.
   * @param {string} suit - the new suit
   */
  socket.on("pickSuit", suit => {
    const suitCard = socket.currGame.updateSuit(suit);
    io.to(socket.gameRoom).emit("updatePile", suitCard);
  })

  socket.on("listGames", (cb) => {
    cb(games);
  })

  /**
   * Join a game.
   * @param {number} index - the index of the game in the games array
   * @returns {boolean} - true if joined the game, false if full
   */
  socket.on("joinGame", (index, cb) => {
    socket.player = new Player();
    const joined = games[index].addPlayer(socket.player);
    if(joined) {
      socket.currGame = games[index];
      socket.gameRoom = socket.currGame.getRoomName();
      socket.join(socket.gameRoom);
    }
    cb(joined);
  })

  /**
   * Leave a game.
   */
  socket.on("leaveGame", () => {
    socket.leave(socket.gameRoom);
  })

  /**
   * Redirect players to the game page.
   * @param {string} room - the room name
   */
  socket.on("gameScreen", room => {
    socket.to(room).emit("goToGamePage");
  })

})