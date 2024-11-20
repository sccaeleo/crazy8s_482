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
    this.deal();
    this.currTurn = this.players[0];
    this.currTurnIndex = 0;

    return true;
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
      if(this.started === true && this.currPlayers() < 2)
        this.ended = true;
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
      // if(!newCard && this.pile.length > 1) {
      //   this.resetPile();
      //   newCard = this.deck.drawCard();
      // }else 
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

  resetPile() {
    const cards = this.pile.splice(0, this.pile.length-1);
    for(const card of cards)
      console.log(card);
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

  currPlayers() {
    return this.numPlayers;
  }

  isOver() {
    return this.ended;
  }
}

module.exports = Game;