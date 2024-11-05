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
    const card = this.hand[index];

    const play = card.compare(pileCard);
    if(play === 8) {
      this.hand.splice(index, 1);
      return 8
    }else if(play) {
      this.hand.splice(index, 1);
      return card
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
}

module.exports = Player;