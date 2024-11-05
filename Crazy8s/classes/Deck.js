const Card = require('../classes/Card.js')

/** A class representing a Deck */
class Deck {

  suits = ["Clubs","Diamonds","Hearts","Spades"];
  ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  cards = [];

  /**
   * Constructor for a Deck
   * Makes an array of cards with a card with every rank for every suit
   */
  constructor() {
    for(const suit of this.suits)
      for(const rank of this.ranks)
        this.cards.push(new Card(suit, rank))
  }

  /**
   * Shuffle's the cards in the array
   */
  shuffle() {
    //for each card swap it with a random card in the deck
    for(var i = 0; i < 52; i++) {
      var newIndex = Math.floor(Math.random()*52);
      
      const temp = this.cards[i];
      this.cards[i] = this.cards[newIndex];
      this.cards[newIndex] = temp;
    }
  }

  /**
   * Gives the player a card from the deck
   * @returns {Card} - the top card in the deck
   */
  drawCard() {
    if(this.isEmpty())
      return false;

    return this.cards.pop()
  }

  /**
   * Checks if the deck is empty
   * @returns {boolean} - true if empty, false if not
   */
  isEmpty() {
    return this.cards.length == 0;
  }
}

module.exports = Deck;