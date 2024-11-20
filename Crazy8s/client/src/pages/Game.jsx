import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

function Game({socket}) {

  // useStates in order to update them on the UI
  const [socketId, setSocketId] = useState('');
  var [hand, setHand] = useState([]);
  var [pileCard, setPileCard] = useState("cardSpadesQ.png")
  var [started, setStarted] = useState(false);
  var [pickSuit, setPickSuit] = useState(false);
  var [resultMessage, setResultMessage] = useState("You Lose");
  var [gameOver, setGameOver] = useState(false);
  const navigate = useNavigate();
  

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  /**
   * tell server to start the game
   */
  const startGame = () => {
    setStarted(true)
    socket.emit("startGame", cb => {
      setHand(cb)
    })
  }


  socket.on("requestHand", hand => {
    setStarted(true);
    socket.emit("getHand", cb => {
      setHand(cb);
    });
  })

  socket.on("lostGame", () =>{
    setGameOver(true);
  })

  socket.on("onePlayer", () => {
    setGameOver(true);
    setResultMessage("You Win");
  })

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
        setHand(temp)
        setPileCard(topCard)
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
   * Update the pile
   */
  socket.on("updatePile", (card) => {
    setPileCard(card);
  })

  /**
   * Pick a suit when you play an 8
   * @param {*} suit - The suit you clicked on
   */
  const pickSuitCall = (suit) => {
    socket.emit("pickSuit", suit);
    setPickSuit(false);
  }

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
          <div>
          {!started && (<button class="btn btn-lg btn-light" onClick={startGame}>Deal</button>)}
          </div>
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
          <div class="player-hand">
          <div data-testid = "player-hand" class="player-hand">
            {hand.map((card, index) => (
              <button class="player-hand card-button" onClick={() => playCard(index)} disabled = {pickSuit}>
              <button data-testid="play-card" class="player-hand card-button" onClick={() => playCard(index)} disabled = {pickSuit}>
                <img key={index} src={require(`./Cards/${card}`)} alt={`Card ${card}`} />
              </button>
            ))}
          </div>

          <div>
            <button class="leave-button" onClick={leaveGame}>Leave Game</button>
            <button class="leave-button btn btn-danger" onClick={leaveGame}>Leave Game</button>
          </div>
        </div>

        {gameOver && (<div class="game-over">
          <button class="leave-button" onClick={leaveGame}>Leave Game</button>
          <h3 className={resultMessage === 'You Win' ? 'win-text' : 'lose-text'}>{resultMessage}</h3>
        </div>)}
        {/* Banner Ad Placeholder */} 
      <Link to={'https://www.google.com'} target="_blank">
      <div
      style={{
        width: '80%',
        height: '10%',
        backgroundColor: 'white',
        border: '2px solid black',
        padding: '10px',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        right: '10%',
        color: 'black'
      }}>
      Banner Ad Placeholder
      </div>
      </Link>

      </div>
    )
  }
  
  
  export default Game