import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";
import PropTypes from 'prop-types';

export const playerHand = [
  'cardSpades5.png',
  'cardHearts2.png',
  'cardDiamonds9.png',
];

function Game({socket}) {

  const [socketId, setSocketId] = useState('');
  const [hand, setHand] = useState([]);
  const [pileCard, setPileCard] = useState('')

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
      //socket.emit("test", "Working")
      //startGame();
      setPileCard('cardSpades5.png')

    }

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  const startGame = () => {
    socket.emit("startGame", cb => {
      setHand(cb)
      // socket.emit("test", cb)
    })
  }

  const playCard = (index) => {
    socket.emit("playCard", index, cb => {
      if(cb == true) {
        var temp = [...hand]
        const newPile = temp.splice(index, 1)
        setHand(temp)
        setPileCard(newPile)
      }
    })
  }

  const drawCard = () => {
    socket.emit("drawCard", cb => {
      var temp = [...hand]
      temp.push(cb)
      setHand(temp)
    })
  }

  // const playCard = () =>

    // The html of the page
    return(
      <div>
        <div class="main-title">
          <h1><b>Crazy 8s</b></h1>
          
        </div>
      
        <div class="game">
          <div>
          <button class="btn btn-lg btn-light" onClick={startGame}>Deal</button>
          </div>
          
          <div class="game-center">
            <button class="deck card-button" onClick={drawCard}><img class="deck" src={require('./Cards/cardBack_red1.png')}></img></button>
            <button class="pile card-button"><img class="pile" src={require('./Cards/cardSpades5.png')}></img></button>
          </div>

          <div class="other-players">

          </div>

          {/* Creates the player's hand */}
          <div class="player-hand">
            {hand.map((card, index) => (
              <button class="player-hand card-button"><img key={index} src={require(`./Cards/${card}`)} alt={`Card ${index}`} /></button>
            ))}
          </div>
        </div>

      </div>
    )
  }
  
  
  export default Game