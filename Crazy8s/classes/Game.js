const Player = require('../classes/Player.js')
const Deck = require('../classes/Deck.js')
const Card = require('../classes/Card.js')

/** A class representing a Game */
class Game {

  pile = [];
  deck;
  players = [];
  currTurn;
  tempSuit = false;

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
    this.deck.shuffle();
    this.deal();
    this.currTurn = this.players[0];
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
      return true;
    }

    return false;
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
        console.log(this.tempSuit);
        card = player.playCard(index, new Card(this.tempSuit, "8"));
        if(card)
          this.tempSuit = false;
      }else{
        card = player.playCard(index, this.pile[this.pile.length-1]);
      }

      if(!card)
        return false;

      this.pile.push(card)
      if(card === 8)
        return 8;
      
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
    return "card" + suit + "8.png";
  }

  /**
   * Draw a card
   * @param {Player} player - the player drawing a card
   * @returns - false if not players turn, the png file of the new card to be displayed
   */
  drawCard(player) {
    if(this.currTurn === player) {
      const newCard = this.deck.drawCard();
      if(!newCard)
        return false;
      
      player.drawCard(newCard);
      return newCard.getStringPNG();
    }
    return false;
  }

  /**
   * Get the file for the pile card
   * @returns The png file for the pile card
   */
  getTopCard() {
    return this.pile[0].getStringPNG();
  }
}

module.exports = Game;