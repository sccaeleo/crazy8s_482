class Player {

    #hand = [];
    #playerId;
    #user;

    constructor(id, user) {
        this.#playerId = id;
        this.#user = user;
    }

    //This will be called Client side, when picking a card
    playCard(cardIndex) {
        r1 = this.#hand.splice(cardIndex, 1);
    }

    //draw a card
    drawCard(card) {
        this.#hand.push(card);
    }

    //check if won
    isEmpty() {
        return this.#hand.length == 0;
    }
}