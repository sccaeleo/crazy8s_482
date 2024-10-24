class Game {

    //establish vars
    #deck;
    #pile = [];
    #players = [];
    #bet;
    #password;
    #host;

    //initialize a deck, add the host and set room settings
    constructor(host, bet, password) {
        this.#deck = new Deck();
        this.#host = new Player(1, host);
        this.#players.push(this.#host);
        this.#bet = bet;
        this.#password = password;
    }

    //player joins a game
    addPlayer(user) {
        size = this.#players.length;

        //check if there is room in the lobby
        if(size < 4) {
            this.#players.push(new Player(size+1, user));
            return true;
        }else{
            return false;
        }
    }

    //deal, pick the first player and then give first player a turn
    startGame() {
        this.deal();
        var firstPlayer = this.#getFirstPlayer();
        this.turn(firstPlayer);
    }

    //get a random integer 0-3 for index of a player
    #getFirstPlayer() {
        var random = Math.random()*4;
        return Math.floor(random);
    }

    //give each player 5 cards
    deal() {
        for(var i = 0; i < 5; i++) {
            for(player of this.#players) {
                card = this.#deck.drawCard();
                player.drawCard(card);
            }
        }
    }

    turn(player) {

    }

    endGame(winner) {

    }
}