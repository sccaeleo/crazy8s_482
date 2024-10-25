class Card {

    #suit;
    #rank;

    constructor(suit, rank)
    {
        this.#suit = suit;
        this.#rank = rank;
    }

    //check if playable
    checkSuitRank(suit, rank)
    {
        if(this.#suit == suit)
            return true;
        if(this.#rank == rank)
            return true;
        return false;
    }

    //compare to another card to see if playable
    compare(other)
    {
        return other.checkSuitRank(this.#suit, this.#rank);
    }

    getPNGString() {
        return "card" + this.#suit + this.#rank + ".png";
    }
}