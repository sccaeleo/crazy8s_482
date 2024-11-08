const Card = require('../classes/Card.js')

/** A class representing a Player */
class Player {
  
  hand = [];

  /**
   * Constructor for a Player
   */
  constructor() {}

  /**
   * Checks if the card is playable and removes it from the players hand if it is.
   * @param {number} index 
   * @param {Card} pileCard 
   * @returns - 8 if it is an 8, the card if it is playable and false if not playable
   */
  playCard(index, pileCard) {
    if(index > this.hand.length-1)
      return false;

    const card = this.hand[index];
    const play = card.compare(pileCard);
    if(play === 8) {
      this.hand.splice(index, 1);
      return {card: card, ret: 8}
    }else if(play) {
      this.hand.splice(index, 1);
      return {card: card, ret: true}
    }else{
      return false;
    }
  }

  /**
   * Puts drawn card into player's hand
   * @param {Card} newCard 
   */
  drawCard(newCard) {
    this.hand.push(newCard);
  }

  /**
   * Gets an array of PNG files for the player's cards
   * @returns {string[]} - array of PNG's to display
   */
  displayCards() {
    const pngs = [];
    for(const card of this.hand)
      pngs.push(card.getStringPNG());   // CHANGE TO getFileName Maybe

    return pngs;
  }

  /**
   * Check if player has a card left
   * @returns {boolean} - true if no cards, false if the player still has a card
   */
  isHandEmpty() {
    if(this.hand.length == 0)
      return true;

    return false;
  }

  /**
   * Get number of cards in hand
   * @returns - number of cards in hand
   */
  numCards() {
    return this.hand.length;
  }

  /**
   * Takes card out of hand and returns them to the deck
   * @returns - hand
   */
  takeCardsBack() {
    return this.hand;
  }
}

module.exports = Player;