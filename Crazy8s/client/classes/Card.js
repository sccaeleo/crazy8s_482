class Card {
    constructor(suit, rank)
    {
        this.suit = suit;
        this.rank = rank;
    }

    checkSuitRank(suit, rank)
    {
        if(this.suit == suit)
            return true;
        if(this.rank == rank)
            return true;
        return false;
    }

    compare(other)
    {
        return other.checkSuitRank(this.suit, this.rank);
    }
}