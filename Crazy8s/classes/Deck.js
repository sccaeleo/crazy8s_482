class Deck {

    //suits and ranks to easily create the deck
    #suits = ["Clubs",'Diamonds','Hearts','Spades'];
    #ranks = ['A','2','3','4','5','6','7','8','9','T','J','Q','K'];
    #cards = [];

    constructor() {
        //for each suit and rank make a card
        for(suit of this.#suits)
            for(rank of this.#ranks)
                this.#cards.push(new Card(suit, rank));
    }

    shuffle()
    {
        //for each card swap it with a random card in the deck
        for(var i = 0; i < 52; i++) {
            var newIndex = Math.random()*52;
            
            let temp = this.#cards[i];
            this.#cards[i] = this.#cards[newIndex];
            this.#cards[newIndex] = temp;
        }
    }

    drawCard() {
        return this.#cards.pop();
    }

    isEmpty() {
        return this.#cards.length == 0;
    }
}