// Backend Stuff

// Import Dependencies
const express = require('express')
const crypto = require('crypto');
const session = require('express-session')
const app = express()
const {db} = require('./firebase.js')
const admin = require('firebase-admin');
const cors = require("cors");
var mysql = require('mysql');
var path = require('path');

// Import Classes
const Game = require('../classes/Game.js')
const Player = require('../classes/Player.js')
const Deck = require('../classes/Deck.js')
const Card = require('../classes/Card.js')

// Port number, can change if needed
const port = 5000

// Middleware functions for express
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

// TODO: set up permanent secret in .env as long term solution
const sessionSecret = crypto.randomBytes(32).toString('hex'); 

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 }
  })
);


/**
 * Adds a user
 */
app.post('/add_user', async (req, res) => {
    const { name, email, password } = req.body;
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

/**
 * Gets a user
 */
app.get('/current-user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' }); 
  }
});

/**
 * Log in to account
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    
    if (userSnapshot.empty) {
      return res.status(401).send('User not found');
    }

    const userData = userSnapshot.docs[0].data();

    
    if (userData.password !== password) {
      return res.status(401).send('Incorrect password');
    }

    
    req.session.user = {
      id: userSnapshot.docs[0].id,
      name: userData.name,
      balance: userData.balance
    };

    res.send('User logged in and session started');
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

/**
 * Log out of account
 */
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.send('User logged out');
  });
});

/**
 * Get an account
 */
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

/**
 * Get a user by their ID
 */
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

/**
 * Edit a user
 */
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

/**
 * Delete a user
 */
app.delete('/delete_user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      await db.collection('users').doc(userId).delete();
      res.status(200).json({ success: 'User deleted successfully' });
  } catch (err) {
      res.status(500).json({ message: 'Something unexpected has occurred' + err });
  }
});

/**
 * Send a friend request
 */
app.post('/add_friend/:userId', async(req, res) => {
  const userId = req.params.userId;
  const { friendId } = req.body;

  try {
    
    const [userDoc, friendDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get()
    ]);

    // Check if both users exist
    if (!userDoc.exists || !friendDoc.exists) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    // Check if friend request already exists
    const friendData = friendDoc.data();
    if (friendData.friend_requests.some(request => request.id === userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if already friends
    if (friendData.friends.some(friend => friend.id === userId)) {
      return res.status(400).json({ message: 'Users are already friends' });
    }

    // Add friend request
    await db.collection('users').doc(friendId).update({
      friend_requests: admin.firestore.FieldValue.arrayUnion({
        id: userId,
        name: userDoc.data().name,
        timestamp: admin.firestore.Timestamp.now()
      })
    });

    res.status(200).json({ success: 'Friend request sent successfully' });

  } catch (err) {
    console.error('Error in add_friend:', err);
    res.status(500).json({ message: 'Server error occurred', error: err.message });
  }
});

/**
 * Accept a friend request
 */
app.post('/accept_friend/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { friendId } = req.body;

  try {
    const [userDoc, friendDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get()
    ]);

    // Check if users are real
    if (!userDoc.exists || !friendDoc.exists) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    const userData = userDoc.data();
    const friendData = friendDoc.data();

    // Verify friend request exists
    const requestIndex = userData.friend_requests.findIndex(request => request.id === friendId);
    if (requestIndex === -1) {
      return res.status(400).json({ message: 'No friend request found' });
    }

    // Batch add
    const batch = db.batch();

    // Add each user to the other's friends list
    const userRef = db.collection('users').doc(userId);
    const friendRef = db.collection('users').doc(friendId);

    batch.update(userRef, {
      friends: admin.firestore.FieldValue.arrayUnion({
        id: friendId,
        name: friendData.name,
        timestamp: admin.firestore.Timestamp.now()
      }),
      friend_requests: admin.firestore.FieldValue.arrayRemove(userData.friend_requests[requestIndex])
    });

    batch.update(friendRef, {
      friends: admin.firestore.FieldValue.arrayUnion({
        id: userId,
        name: userData.name,
        timestamp: admin.firestore.Timestamp.now()
      })
    });

    //create converstion on friend request accept
    //create conversation id
    const conversationId = [userId, friendId].sort().join('_');
    const conversationRef = db.collection('conversations').doc(conversationId);

    const conversationDoc = await conversationRef.get();

    //check if conversation exists, proceed with message collection
    if (!conversationDoc.exists) {
      
      batch.set(conversationRef, {
        participants: [
          db.collection('users').doc(userId),
          db.collection('users').doc(friendId)
        ],
        lastMessage: null 
      });

      //
      const messagesRef = conversationRef.collection('messages');
      batch.set(messagesRef.doc(), {
        senderId: userId,
        content: "Conversation started!",
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();

    res.status(200).json({ success: 'Friend added and conversation created successfully' });

  } catch (err) {
    console.error('Error in accept_friend:', err);
    res.status(500).json({ message: 'Server error occurred', error: err.message });
  }
});

/**
 * gets conversation 
 */
app.get('/conversations/:conversationId/messages', async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Fetch the conversation document
    const messagesRef = db.collection('conversations').doc(conversationId).collection('messages');
    const messagesSnapshot = await messagesRef.orderBy('timestamp', 'asc').get();

    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching message history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// DO NOT ACCIDENTALLY DELETE
// I didn not listen and paid the price - will
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
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003','http://localhost:3004'];

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
    //io.to(socket.gameRoom).emit("PlayerNumCards", socket.currGame.playerNumCards());
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
      console.log("This was called: " + socket.currGame.getTopCard());
      io.to(socket.gameRoom).emit("updatePile", socket.currGame.getTopCard());
      console.log("worked");
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
    socket.currGame.removePlayer(socket.player);
    socket.currGame = undefined;
    socket.player = undefined;
    socket.gameRoom = undefined;
  })

  /**
   * Redirect players to the game page.
   * @param {string} room - the room name
   */
  socket.on("gameScreen", room => {
    socket.to(room).emit("goToGamePage");
  })


})