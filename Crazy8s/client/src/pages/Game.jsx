import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";
import PropTypes from 'prop-types';

function Game({socket}) {

  // useStates in order to update them on the UI
  const [socketId, setSocketId] = useState('');
  var [hand, setHand] = useState([]);
  var [pileCard, setPileCard] = useState("cardSpadesQ.png")
  var [started, setStarted] = useState(false);
  var [pickSuit, setPickSuit] = useState(false);
  

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

  // tell server to start the game
  const startGame = () => {
    setStarted(true)
    socket.emit("startGame", cb => {
      setHand(cb)
      // setPileCard("cardSpadesQ.png")
    })
  }

  // tell the server what card you want to play
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
    })
  }


  // tell server to give you a card
  const drawCard = () => {
    socket.emit("drawCard", cb => {
      if(cb === false)
        return
      var temp = [...hand]
      temp.push(cb)
      setHand(temp)
    })
  }

  socket.on("updatePile", (card) => {
    setPileCard(card);
  })

  const pickSuitCall = (suit) => {
    socket.emit("pickSuit", suit);
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
          
          <div class="game-center">
            <button class="deck card-button" onClick={drawCard}>
              <img class="deck" src={require('./Cards/cardBack_red1.png')} alt={'Deck'}></img>
            </button>
            <button class="pile card-button" onClick={() => drawCard}>
              <img class="pile" src={require(`./Cards/${pileCard}`)} alt={`${pileCard}`}></img>
            </button>
          </div>

          <div class="other-players">

          </div>

          {/* Suit icons */}
          <div class="suits">
            <button class="pile card-button" onClick={() => pickSuit}>
              <img class="icon" src={require(`./Cards/clubs.png`)} alt={"clubs"}></img>
            </button>
          </div>

          {/* Creates the player's hand */}
          <div class="player-hand">
            {hand.map((card, index) => (
              <button class="player-hand card-button" onClick={() => playCard(index)}>
                <img key={index} src={require(`./Cards/${card}`)} alt={`Card ${card}`} />
              </button>
            ))}
          </div>
        </div>

      </div>
    )
  }
  
  
  export default Game