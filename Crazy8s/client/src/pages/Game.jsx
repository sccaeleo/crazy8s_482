import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function Game({socket}) {

  // useStates in order to update them on the UI
  const [hand, setHand] = useState([]);
  const [pileCard, setPileCard] = useState("cardSpadesQ.png")
  const [started, setStarted] = useState(false);
  const [pickSuit, setPickSuit] = useState(false);
  const [resultMessage, setResultMessage] = useState("You Lose");
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState();
  const [playerHands, setPlayerHands] = useState();
  const [turn, setTurn] = useState('');

  const navigate = useNavigate();
  

  useEffect(() => {
    if (socket) {
      socket.emit("getUsername", (cb) =>{
        setUsername(cb);
      })
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  // ---------------------------------------- Server to Client ----------------------------------------

  /**
   * Server tells client to ask it for its hand, then player calls for its hand and sets hand useState to the callback
   */
  socket.on("requestHand", () => {
    setStarted(true);
    socket.emit("getHand", cb => {
      setHand(cb);
    });
  })

  /**
   * Update map of usernames and number of cards for each and set it to playerHands 
   */
  socket.on("updateHands", hands => {
    const myIndex = hands.findIndex(player => player.username === username);
    if(myIndex === -1)
      return;

    const filteredList = hands.filter(player => player.username !== username);
    const startIndex = (myIndex) % hands.length;
    const newPlayerHands = [...filteredList.slice(startIndex), ...filteredList.slice(0, startIndex)];
    setPlayerHands(newPlayerHands);
  })

  /**
   * Update the pile
   */
  socket.on("updatePile", (card) => {
    setPileCard(card);
  })

  /**
   * Call to subtract balance when you lose a game
   */
  socket.on("lostGame", () =>{
    socket.emit("subtractBalance");
    setGameOver(true);
  })

  /**
   * Server tells client that its the only player in the lobby, show win screen, add bet
   */
  socket.on("onePlayer", () => {
    socket.emit("winByTechnicality");
    setGameOver(true);
    setResultMessage("You Win");
  })

  /**
   * Get username of player whos turn it is
   */
  socket.on("turn", (username) => {
    setTurn(username);
  })

  // ---------------------------------------- Client to Server ----------------------------------------

  /**
   * tell server to start the game
   */
  const startGame = () => {
    setStarted(true)
    socket.emit("startGame", cb => {
      setHand(cb)
    })
  }

  /**
   * tell the server what card you want to play
   * @param {*} index - The number corresponding to the position of the card in hand
   */
  const playCard = (index) => {
    socket.emit("playCard", index, cb => {
      // make sure that it is your turn and the card is playable
      if(cb) {
        var temp = [...hand]
        const topCard = temp.splice(index, 1)
        setHand(temp);
        setPileCard(topCard);
      }

      if(cb === 8)
        setPickSuit(true);

      if(cb === "win") {
        setGameOver(true);
        setResultMessage("You Win");
      }
    })
  }

  /**
   * tell server to give you a card
   */
  const drawCard = () => {
    socket.emit("drawCard", cb => {
      if(cb === false)
        return
      var temp = [...hand]
      temp.push(cb)
      setHand(temp)
    })
  }

  /**
   * Pick a suit when you play an 8
   * @param {*} suit - The suit you clicked on
   */
  const pickSuitCall = (suit) => {
    socket.emit("pickSuit", suit);
    setPickSuit(false);
  }

  /**
   * Leave the game
   */
  const leaveGame = () => {
    socket.emit("leaveGame");
    navigate("/");
  }

    // The html of the page
    return(
      <div>
        <div class="main-title">
          <h1><b>Crazy 8s</b></h1>
          
        </div>
      
        <div class="game">
          

          {!started && (<button data-testid = "dbutton" class="btn btn-lg btn-light" onClick={startGame}>Deal</button>)}

          
          {/* The Deck and Pile*/}
          <div class="game-center">
            <button class="deck card-button" onClick={drawCard} disabled = {pickSuit}>
              <img class="deck" src={require('./Cards/cardBack_red1.png')} alt={'Deck'}></img>
            </button>
            <button class="pile card-button" onClick={() => drawCard}>
              <img class="pile" src={require(`./Cards/${pileCard}`)} alt={`${pileCard}`}></img>
            </button>
          </div>

          <div class="other-players">

          </div>

          {/* Suit icons */}
          {pickSuit && (<div class="suits">
            <button class="pile card-button" onClick={() => pickSuitCall("Clubs")}>
              <img class="icon" src={require(`./Cards/clubs.png`)} alt={"clubs"}></img>
            </button>
            <button class="pile card-button" onClick={() => pickSuitCall("Hearts")}>
              <img class="icon" src={require(`./Cards/hearts.png`)} alt={"clubs"}></img>
            </button>
            <button class="pile card-button" onClick={() => pickSuitCall("Spades")}>
              <img class="icon" src={require(`./Cards/spades.png`)} alt={"clubs"}></img>
            </button>
            <button class="pile card-button" onClick={() => pickSuitCall("Diamonds")}>
              <img class="icon" src={require(`./Cards/diamonds.png`)} alt={"clubs"}></img>
            </button>
          </div>)}

          <div>
            {pickSuit && (<h2>Pick a suit</h2>)}
            {/* {pickSuit && (<h2>Picking Suit</h2>)} */}
          </div>

          {/* Creates the player's hand */}
          <div data-testid = "player-hand" class="player-hand">
            {hand.map((card, index) => (
              <button data-testid="play-card" class="player-hand card-button" onClick={() => playCard(index)} disabled = {pickSuit}>
                <img key={index} src={require(`./Cards/${card}`)} alt={`Card ${card}`} />
              </button>
            ))}
          </div>

          {/*THIS IS HIP TOO - Jack - This is cool because the position of the players change based off the amount of players in the game.*/}
          <div class="other-players">
            {playerHands?.length > 0 && playerHands.map((player, index) => {
              let positionClass;
              if (playerHands.length < 3) {
                if (index === 0) {
                  positionClass = 'opponent-2';
                } else if (index === 1) {
                  positionClass = 'opponent-3';
                } else {
                  positionClass = `opponent-${index + 1}`;
                }
              } else {
                positionClass = `opponent-${index + 1}`;
              }

              return (
                <div key={player.username} className={`player-corner ${positionClass}`}>
                  {/* White background for username */}
                  <div className="player-name">
                    <p>{player.username}</p>
                  </div>
        
                  {/* Card back image with "x numCards" */}
                  <div className="player-cards">
                    <img className="card-back" src={require('./Cards/cardBack_red1.png')} alt="Card Back" />
                    <p>x {player.numCards}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <button class="leave-button btn btn-danger" onClick={leaveGame}>Leave Game</button>
          </div>

          <div class="turn">
            <h4>It is {turn}'s turn</h4>
          </div>
        </div>

        {gameOver && (<div class="game-over">
          <button class="leave-button btn btn-danger" onClick={leaveGame}>Leave Game</button>
          <h3 className={resultMessage === 'You Win' ? 'win-text' : 'lose-text'}>{resultMessage}</h3>
        </div>)}
        {/* Banner Ad Placeholder */} 
      <Link to={'https://www.google.com'} target="_blank">
      <div
      style={{
        width: '35%',
        height: '10%',
        backgroundColor: 'white',
        border: '2px solid black',
        padding: '10px',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        right: '5%',
        color: 'black'
      }}>
      Banner Ad Placeholder
      </div>
      </Link>

      </div>
    )
  }
  
  
  export default Game