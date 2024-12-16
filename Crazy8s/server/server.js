// Backend Stuff
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
const { FieldValue } = require('firebase-admin/firestore')

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


app.set('io', io);

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
          balance:100,
          games_played:0,
          wins:0,
          losses:0,
          isAdmin:false
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
  const { email, password, socketId } = req.body;

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


    const io = req.app.get('io');
    const socket = io.sockets.sockets.get(socketId);

    if(socket) {
      socket.user = new Proxy(req.session.user, {
        get(target, prop) {
          return target[prop]; // Forward gets to req.session.user
        },
        set(target, prop, value) {
          target[prop] = value; // Forward sets to req.session.user
          req.session.save((err) => {
            if (err) console.error('Session save error:', err);
          });
          return true;
        },
      });
    }
      //socket.user = req.session.user;

    res.status(200).send('User logged in and session started');
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
 * Gets all accounts
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
 * Get reports
 */
app.get('/reports', async (req, res) => {
  try {
    const reportsSnapshot = await db.collection('reports').get();
    const reports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * send a report
 */
app.post('/report', async (req, res) => {
  try {
    const { username, issue } = req.body;
    
    if (!username || !issue) {
      return res.status(400).json({ message: 'Username and issue are required' });
    }

    const reportRef = await db.collection('reports').add({
      username: username,
      issue: issue
    });

    res.status(201).json({ 
      message: 'Report created successfully',
      id: reportRef.id 
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ message: 'Error creating report' });
  }
});

/**
 * delete a report
 */

app.delete('/reports/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;
    await db.collection('reports').doc(reportId).delete();
    res.status(200).json({ message: 'Report successfully deleted' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ message: 'Error deleting report', error: err.message });
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
 * Edit balance, wins, losses
 */
app.post('/edit_user_bwl/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { balance, wins, losses} = req.body;
  try {
      await db.collection('users').doc(userId).update({
          balance,
          wins,
          losses
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
  const { friendName } = req.body;

  console.log('Received friendName:', friendName);
// THIS IS HIP TOO Will, this querySnapshot is what allows us to find a user by name and not their doccument id in the database, was a key fix from last time as he had to use ID numbers to add friends
  try {
    const friendQuerySnapshot = await db.collection('users')
      .where('name', '==', friendName)
      .limit(1)
      .get();
    if (friendQuerySnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }
    const friendDoc = friendQuerySnapshot.docs[0];
    const friendId = friendDoc.id;

    const [userDoc, fullFriendDoc] = await Promise.all([
      db.collection('users').doc(userId).get(),
      db.collection('users').doc(friendId).get()
    ]);

  
    if (!userDoc.exists || !fullFriendDoc.exists) {
      return res.status(404).json({ message: 'One or both users not found' });
    }

    const friendData = fullFriendDoc.data();
    if (friendData.friend_requests.some(request => request.id === userId)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    if (friendData.friends.some(friend => friend.id === userId)) {
      return res.status(400).json({ message: 'Users are already friends' });
    }

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

app.post("/conversations/:conversationId/messages", async (req, res) => {
  const { conversationId } = req.params;
  const { senderId, recipientId, content } = req.body;

  if (!content || !senderId || !recipientId) {
    return res.status(400).send("Invalid message data");
  }

  try {
    const conversationRef = db.collection("conversations").doc(conversationId);
    await conversationRef.collection("messages").add({
      senderId,
      recipientId,
      content,
      timestamp: new Date(),
    });

    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).send("Failed to send message");
  }
});



// DO NOT ACCIDENTALLY DELETE
// I didn not listen and paid the price - will
// Same - vic
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

  // ---------------------------------------- CreateGame.jsx and Lobby.jsx Socket Functions ----------------------------------------

  /**
   * Returns this players username
   */
  socket.on("getUsername", (cb) => {  // Also used by Game.jsx
    cb(socket.player.getUsername());
  })

  /**
   * Returns the list of usernames currently in the game
   */
  socket.on("updatePlayers", (cb) => {
    const usernames = socket.currGame.playerNumCards();

    cb(usernames.map(user => user.username));
  })

  /**
   * Create a new Game
   * @param {*} data - game information
   */
  socket.on("createGame", (data) => {
    if(socket.user) {
      socket.player = new Player(socket.user.name);
    }else{
      socket.guestName = "Player 1"
      socket.player = new Player(socket.guestName);
    }

    const { room, bet, password, isPublic } = data;
    const game = createNewGame(socket.player, room, bet, password, isPublic);
    socket.currGame = game;
    socket.join(room);
    socket.gameRoom = room;
  })

  /**
   * Redirect players to the game page.
   * @param {string} room - the room name
   */
  socket.on("gameScreen", room => {
    if(socket.currGame.currPlayers() > 1)
      io.to(room).emit("goToGamePage");
  })

  // ---------------------------------------- JoinGame.jsx Socket Functions ----------------------------------------

  /**
   * Returns the list of games
   */
  socket.on("listGames", (cb) => {
    cb(games);
  })

  /**
   * Join a game.
   * @param {number} index - the index of the game in the games array
   * @returns {boolean} - true if joined the game, false if full
   */
  socket.on("joinGame", (index, cb) => {
    if(socket.user) {
      socket.player = new Player(socket.user.name);
    }else{
      const numPlayers = games[index].currPlayers();
      const guest = "Player " + (numPlayers + 1);
      socket.player = new Player(guest);
      console.log("ADDED: " + socket.player.username);
    }
    const joined = games[index].addPlayer(socket.player);
    if(joined) {
      socket.currGame = games[index];
      socket.gameRoom = socket.currGame.getRoomName();
      socket.join(socket.gameRoom);
    }

    const usernames = socket.currGame.playerNumCards();
    socket.to(socket.gameRoom).emit("updatePlayers", usernames.map(user => user.username));
    cb(joined);
  })

  // ---------------------------------------- Game.jsx Socket Functions ----------------------------------------

  /**
   * Start your game.
   * @returns {string[]} - a list of your cards png files as strings
   */
  socket.on("startGame", (cb) => {
    const started = socket.currGame.startGame();
    io.to(socket.gameRoom).emit("updatePile", socket.currGame.getTopCard());
    socket.to(socket.gameRoom).emit("requestHand");
    io.to(socket.gameRoom).emit("updateHands", socket.currGame.playerNumCards());
    io.to(socket.gameRoom).emit("turn", socket.currGame.turn());
    cb(socket.player.displayCards());
  })

  /**
   * Asks for players hand.
   * @returns {string[]} - a list of your cards png files as strings
   */
  socket.on("getHand", cb => {
    cb(socket.player.displayCards());
  })

  /**
   * Play a card.
   * @param {number} index - the index of the card to play
   * @returns {boolean} - true if played, false if not
   */
  socket.on("playCard", async (index, cb) => {
    const played = socket.currGame.playCard(socket.player, index);
    if(played) {
      io.to(socket.gameRoom).emit("updatePile", socket.currGame.getTopCard());
      socket.to(socket.gameRoom).emit("updateHands", socket.currGame.playerNumCards());
    }

    if(played === "win") {
      socket.to(socket.gameRoom).emit("lostGame");
      if(socket.user) {
        const newBalance = socket.currGame.handleBet(socket.user.balance, true);
        socket.user.balance = newBalance;
        socket.user.games++;
        socket.user.wins++;

        try {
          await db.collection('users').doc(socket.user.id).update({
            games_played: FieldValue.increment(1),
            wins: FieldValue.increment(1),
            balance: newBalance
          });
      } catch (err) {
          console.error('Failed to update wins in the database:', err);
      }
      }
    }
    
    if(played !== 8)
      io.to(socket.gameRoom).emit("turn", socket.currGame.turn());

    cb(played);
  })

  /**
   * Draw a card.
   * @returns {string} - the png file to your card
   */
  socket.on("drawCard", (cb) => {
    const card = socket.currGame.drawCard(socket.player);
    socket.to(socket.gameRoom).emit("updateHands", socket.currGame.playerNumCards());
    if(!card)
      io.to(socket.gameRoom).emit("turn", socket.currGame.turn());
    cb(card);
  })

  /**
   * Pick the suit after playing an 8.
   * @param {string} suit - the new suit
   */
  socket.on("pickSuit", suit => {
    const suitCard = socket.currGame.updateSuit(suit);
    io.to(socket.gameRoom).emit("updatePile", suitCard);
    io.to(socket.gameRoom).emit("turn", socket.currGame.turn());
  })

  /**
   * Leave a game.
   */
  socket.on("leaveGame", async () => {
    socket.leave(socket.gameRoom);
    socket.currGame.removePlayer(socket.player);
    if(socket.currGame.started && !(socket.currGame.isOver()) && socket.user) {
      const newBalance = socket.currGame.handleBet(socket.user.balance, false);
      socket.user.balance = newBalance;
      socket.user.games++;
      socket.user.losses++;
      try {
        await db.collection('users').doc(socket.user.id).update({
          games_played: FieldValue.increment(1),
          losses: FieldValue.increment(1)
        });
    } catch (err) {
        console.error('Failed to update wins in the database:', err);
    }
    }

    const numPlayers = socket.currGame.currPlayers();
    if(numPlayers === 1 && !(socket.currGame.isOver()))
      socket.to(socket.gameRoom).emit("onePlayer");
    if(numPlayers === 0)
      games = games.filter(game => game !== socket.currGame);

    socket.currGame = undefined;
    socket.player = undefined;
    socket.gameRoom = undefined;
  })

  /**
   * Update players balance when the player wins by everyone else leaving the game
   */
  socket.on("winByTechnicality", async () => {
    if(!socket.user)
      return;
    const newBalance = socket.currGame.handleBet(socket.user.balance, true);
    socket.user.balance = newBalance;
    socket.currGame.endGame();
    socket.user.games++;
    socket.user.wins++;
    try {
      await db.collection('users').doc(socket.user.id).update({
        games_played: FieldValue.increment(1),
        wins: FieldValue.increment(1)
      });
  } catch (err) {
      console.error('Failed to update wins in the database:', err);
  }
  })

  /**
   * Substract bet from players balance for losing the game
   */
  socket.on("subtractBalance",async () => {
    if(!socket.user)
      return;
    const newBalance = socket.currGame.handleBet(socket.user.balance, false);
    socket.user.balance = newBalance;
    socket.user.games++;
    socket.user.losses++;
    try {
      await db.collection('users').doc(socket.user.id).update({
        games_played: FieldValue.increment(1),
        losses: FieldValue.increment(1)
      });
  } catch (err) {
      console.error('Failed to update wins in the database:', err);
  }
  })

})