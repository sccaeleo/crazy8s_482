/** A class representing a Card */
class Card {

    suit;
    rank;
  
    /**
     * A constructor for a Card
     * @param {string} suit - the suit of the card
     * @param {string} rank - the rank of the card
     */
    constructor(suit, rank)
    {
        this.suit = suit;
        this.rank = rank;
    }
  
    /**
     * Check if the card is of the same suit or rank of other, or is an 8
     * @param {Card} other - the card to compare to
     * @returns - 8 if this card is an 8, true if suit or rank is the same as other's or false if not
     */
    compare(other)
    {
        if(this.rank == "8")
            return 8;
        else if(this.rank == other.rank)
            return true;
        else if(this.suit == other.suit)
            return true;
        else
            return false;
    }
  
    /**
     * Get the address to the png of the card
     * @returns {string} - the file address of the card's png
     */
    getStringPNG() {
        return "card" + this.suit + this.rank + ".png";
    }
}

module.exports = Card;