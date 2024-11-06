const Game = require('../classes/Game.js')
const Player = require('../classes/Player.js')
const Deck = require('../classes/Deck.js')
const Card = require('../classes/Card.js')
const { start } = require('repl')

// ------------------ CARD CLASS ------------------

test('Card: makes a new card with suit Spades and rank 5', () => {
    const card = new Card("Spades", "5");
    expect(card.suit).toBe("Spades");
    expect(card.rank).toBe("5");
})

test('Card: compare suits of a card', () => {
    const c1 = new Card("Spades", "5");
    const c2 = new Card("Spades", "6");
    expect(c1.compare(c2)).toBe(true);
})

test('Card: compare ranks of a card', () => {
    const c1 = new Card("Spades", "5");
    const c2 = new Card("Hearts", "5");
    expect(c1.compare(c2)).toBe(true);
})

test('Card: compare playing an 8', () => {
    const c1 = new Card("Spades", "8");
    const c2 = new Card("Spades", "6");
    expect(c1.compare(c2)).toBe(8);
})

test('Card: compare not playable', () => {
    const c1 = new Card("Spades", "5");
    const c2 = new Card("Hearts", "6");
    expect(c1.compare(c2)).toBe(false);
})

test('Card: gets the png of a card', () => {
    const c1 = new Card("Spades", "5");
    expect(c1.getStringPNG()).toBe("cardSpades5.png");
})

// ------------------ DECK CLASS ------------------

test('Deck: make sure that the deck is 52 cards', () => {
    const deck = new Deck();
    expect(deck.cards.length).toBe(52);
})

test('Deck: make sure cards are shuffled', () => {
    const deck = new Deck();
    const preCard1 = deck.cards[0];
    const preCard2 = deck.cards[14];
    const preCard3 = deck.cards[34];
    
    deck.shuffle();
    const postCard1 = deck.cards[0];
    const postCard2 = deck.cards[14];
    const postCard3 = deck.cards[34];

    const test1 = preCard1 === postCard1;
    const test2 = preCard2 === postCard2;
    const test3 = preCard3 === postCard3;

    // Most likely not the case if shuffled, but possible
    expect(test1 && test2 && test3).toBe(false);
})

test('Deck: draw a card', () => {
    const deck = new Deck();
    expect(deck.drawCard()).toStrictEqual(new Card("Spades", "K"));
})

test('Deck: draw a card with no cards left', () => {
    const deck = new Deck();
    for(var i = 0; i < 52; i++)
        deck.drawCard();
    expect(deck.drawCard()).toBe(false);
})

test('Deck: check if empty', () => {
    const deck = new Deck();
    expect(deck.isEmpty()).toBe(false);
})

test('Deck: check if empty, is empty', () => {
    const deck = new Deck();
    for(var i = 0; i < 52; i++)
        deck.drawCard();
    expect(deck.isEmpty()).toBe(true);
})

// ----------------- PLAYER CLASS -----------------

test('Player: Check if empty hand is empty', () => {
    const player = new Player();
    expect(player.isHandEmpty()).toBe(true);
})

test('Player: add a card to players deck with draw card', () => {
    const player = new Player();
    player.drawCard(new Card("Clubs", "A"));
    expect(player.isHandEmpty()).toBe(false);
})

test('Player: play a card without any cards', () => {
    const player = new Player();
    expect(player.playCard(0, new Card("Spades", "5"))).toBe(false);
})

test('Player: Play an 8', () => {
    const player = new Player();
    player.drawCard(new Card("Clubs", "8"));
    expect(player.playCard(0, new Card("Spades", "5"))).toBe(8);
})

test('Player: Play playable card', () => {
    const player = new Player();
    player.drawCard(new Card("Clubs", "5"));
    expect(player.playCard(0, new Card("Spades", "5"))).toStrictEqual(new Card("Clubs", "5"));
})

test('Player: Play unplayable card', () => {
    const player = new Player();
    player.drawCard(new Card("Clubs", "9"));
    expect(player.playCard(0, new Card("Spades", "5"))).toBe(false);
})

test('Player: Check display cards', () => {
    const player = new Player();
    player.drawCard(new Card("Clubs", "8"));
    player.drawCard(new Card("Hearts", "2"))
    expect(player.displayCards()).toStrictEqual(["cardClubs8.png", "cardHearts2.png"]);
})

// ------------------ GAME CLASS ------------------

test('Game: Check if deck is initialized', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    expect(game.deck).not.toBe(undefined);
})

test('Game: Make sure the game is dealing on start', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    game.startGame();
    for(var i = 0; i < game.players.length; i++)
        expect(game.players[i].isHandEmpty()).toBe(false);
    expect(game.numPlayers).toBe(1);
})

test('Game: Add a player to the game', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    const joined = game.addPlayer(new Player());
    expect(joined).toBe(true);
    game.startGame();
})

test('Game: add player when game is full', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    game.addPlayer(new Player())
    game.addPlayer(new Player())
    game.addPlayer(new Player())
    game.addPlayer(new Player())
    const joined = game.addPlayer(new Player())
    expect(joined).toBe(false);
})

test('Game: change turn when not last player', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    game.addPlayer(new Player());
    game.startGame();
    game.changeTurn();
    expect(game.currTurnIndex).toBe(1);
})

test('Game: change turn when last player', () => {
    const game = new Game(new Player, "test room", 5, "", true);
    game.addPlayer(new Player());
    game.startGame();
    game.changeTurn();
    game.changeTurn();
    expect(game.currTurnIndex).toBe(0);
})

test('Game: play a card when not your turn', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();
    expect(game.playCard(p2, 1)).toBe(false);
})

test('Game: play a card that is not playable', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    // I can't control the variables when testing so I have to manipulate them
    p1.hand = [new Card("Spades", "2")];
    game.pile = [new Card("Hearts", "3")];
    expect(game.playCard(p1, 0)).toBe(false);
})

test('Game: play a card that is playable', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    // I can't control the variables when testing so I have to manipulate them
    p1.hand = [new Card("Spades", "2")];
    game.pile = [new Card("Hearts", "2")];
    expect(game.playCard(p1, 0)).toBe(true);
})

test('Game: play an 8', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    // I can't control the variables when testing so I have to manipulate them
    p1.hand = [new Card("Spades", "8")];
    expect(game.playCard(p1, 0)).toBe(8);
})

test('Game: update the suit after an 8', () => {
    const p1 = new Player();
    const game = new Game(p1, "test room", 5, "", true);
    expect(game.updateSuit("Spades")).toBe("cardSpades8.png");
})

test('Game: play a card when tempSuit is set', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    // I can't control the variables when testing so I have to manipulate them
    game.pile = [new Card("Clubs", "8")];
    game.updateSuit("Spades"); // changes turn
    p2.hand = [new Card("Spades", "4")];
    expect(game.playCard(p2, 0)).toBe(true);
})

test('Game: play a card when tempSuit is set but not playable', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    // I can't control the variables when testing so I have to manipulate them
    game.pile = [new Card("Clubs", "8")];
    game.updateSuit("Spades"); // changes turn
    p2.hand = [new Card("Hearts", "4")];
    expect(game.tempSuit).toBe("Spades");
    expect(game.playCard(p2, 0)).toBe(false);
})

test('Game: draw a card when turn', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    expect(game.drawCard(p1)).not.toBe(false);
})

test('Game: draw a card when not turn', () => {
    const p1 = new Player();
    const p2  = new Player();

    const game = new Game(p1, "test room", 5, "", true);
    game.addPlayer(p2);
    game.startGame();

    expect(game.drawCard(p2)).toBe(false);
})

test('Game: draw a card when not turn', () => {
    const game = new Game(new Player(), "test room", 5, "", true);
    expect(game.getRoomName()).toBe("test room");
})