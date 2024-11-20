const Player = require('../classes/Player.js')
const Deck = require('../classes/Deck.js')
const Card = require('../classes/Card.js')

/** A class representing a Game */
class Game {

  pile = [];
  deck;
  players = [];
  currTurn;
  currTurnIndex;
  drawCount = 0;
  numPlayers;
  tempSuit = false;
  started = false;
  ended = false;
  originalNumPlayers;

  roomName;
  bet;
  password;
  isPublic;

  /**
   * Create a Game
   * @param {Player} host - the host of the game
   */
  constructor(host, roomName, bet, password, isPublic) {
    this.players.push(host);
    this.numPlayers = 1;
    this.roomName = roomName;
    this.bet = bet;
    this.password = password;
    this.isPublic = isPublic;
    this.deck = new Deck();
  }

  /**
   * Start the Game
   */
  startGame() {
    if(this.numPlayers < 2)
      return false;

    this.started = true;
    this.originalNumPlayers = this.numPlayers;
    this.deal();
    this.randomTurn();
    // this.currTurn = this.players[0];
    // this.currTurnIndex = 0;

    return true;
  }

  /**
   * Set the first turn to a random person
   */
  randomTurn() {
    const rand = Math.floor(Math.random()*this.numPlayers);
    console.log("NumPlayers: " + this.numPlayers + "Random: " + rand);
    this.currTurn = this.players[rand];
    this.currTurnIndex = rand;
  }

  /**
   * Return the username of the player whos turn it is
   * @returns - the username of the player
   */
  turn() {
    return this.currTurn.getUsername();
  }

  /**
   * Deal cards to each player
   */
  deal() {
    for(var i = 0; i < 5; i++) {
      for(const player of this.players) {
        const card = this.deck.drawCard();
        player.drawCard(card);
      }
    }

    this.pile.push(this.deck.drawCard());
  }

  /**
   * Add a player to the game
   * @param {Player} player - the new player to add 
   * @returns {boolean} - true if player joined, false if full
   */
  addPlayer(player) {
    if(this.started)
      return false;
    if(this.players.length < 5) {
      this.players.push(player);
      this.numPlayers++;
      return true;
    }

    return false;
  }

  /**
   * Removes a player from the game.
   * @param {Player} player 
   */
  removePlayer(player) {
    const index = this.players.indexOf(player);
    if(index > -1) {
      var hand = player.takeCardsBack();
      for(const card of hand) {
        this.pile.unshift(card);
      }
      this.changeTurn();
      this.players.splice(index, 1);
      this.numPlayers--;
    }
  }

  /**
   * Changes the turn to the next player
   */
  changeTurn() {
    if(this.currTurnIndex < this.numPlayers-1) {
      this.currTurnIndex++;
    }else{
      this.currTurnIndex = 0;
    }
    this.currTurn = this.players[this.currTurnIndex];
    this.drawCount = 0;
  }

  /**
   * Play a card
   * @param {Player} player - the player playing a card
   * @param {number} index - the index of the card in the players hand
   * @returns {boolean} - true if played, false if not
   */
  playCard(player, index) {
    if(this.currTurn === player) {
      var card = false;
      if(this.tempSuit) {
        card = player.playCard(index, new Card(this.tempSuit, "8"));
        if(card)
          this.tempSuit = false;
      }else{
        card = player.playCard(index, this.pile[this.pile.length-1]);
      }

      if(!card)
        return false;

      this.pile.push(card.card);
      if(player.isHandEmpty()) {
        this.ended = true;
        return "win";
      }

      if(card.ret === 8)
        return 8;
      
      this.changeTurn();
      return true;
    }
    return false;
  }

  /**
   * Update the current suit of the pile, after an 8 is played
   * @param {string} suit - the new suit
   * @returns {string} - new card to be displayed
   */
  updateSuit(suit) {
    this.tempSuit = suit;
    this.changeTurn();
    return "card" + this.tempSuit + "8.png";
  }

  /**
   * Draw a card
   * @param {Player} player - the player drawing a card
   * @returns - false if not players turn, the png file of the new card to be displayed
   */
  drawCard(player) {
    if(this.currTurn === player) {
      if(this.drawCount === 3) {
        this.changeTurn();
        return false;
      }
      const newCard = this.deck.drawCard();
      if(!newCard)
        return false;
      
      if(this.deck.isEmpty() && this.pile.length > 1)
        this.resetPile();

      player.drawCard(newCard);
      this.drawCount++;
      return newCard.getStringPNG();
    }
    return false;
  }

  /**
   * Take all the cards from pile except the top one and add them to the bottom of the deck.
   */
  resetPile() {
    const cards = this.pile.splice(0, this.pile.length-1);
    this.deck.addCards(cards);
  }

  /**
   * Get the file for the pile card
   * @returns {string} - The png file for the pile card
   */
  getTopCard() {
    return this.pile[this.pile.length-1].getStringPNG();
  }

  /**
   * Get the room name
   * @returns {string} - roomName
   */
  getRoomName() {
    return this.roomName;
  }

  /**
   * Get other players num cards
   */
  playerNumCards() {
    const numPerPlayer = [];
    for(const p1 of this.players)
      numPerPlayer.push({username: p1.username, numCards: p1.numCards()});
    // push username and numCards and then return that to the client

    // console.log(numPerPlayer);
    return numPerPlayer;
  }

  /**
   * Get the amount of players currently in the game
   * @returns {number} - current number of players in the game
   */
  currPlayers() {
    return this.numPlayers;
  }

  /**
   * Check if the game is over
   * @returns {boolean} - true if someone won, false if not
   */
  isOver() {
    return this.ended;
  }

  /**
   * Set ended to done (used for one corner case)
   */
  endGame() {
    this.ended = true;
  }

  /**
   * Adds or Substracts bet to balance
   * @param {*} balance - the users current balance
   * @param {*} won - true if won, false if not
   * @returns {number} - the new balance after the game
   */
  handleBet(balance, won) {
    if(won)
      return balance + this.bet*(this.originalNumPlayers-1);
    else
      return balance - this.bet;
  }
}

module.exports = Game;