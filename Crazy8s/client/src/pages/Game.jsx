import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";
import PropTypes from 'prop-types';

export const playerHand = [
  'cardSpades5.png',
  'cardHearts2.png',
  'cardDiamonds9.png',
];

function Game({socket}){

  const [socketId, setSocketId] = useState('');

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
      startGame();
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  const startGame = () => {
    const test = ["cardSpadesK.png","cardSpadesQ.png","cardSpadesJ.png","cardSpades10.png","cardSpades9.png"]
    var count;
    socket.emit("startGame", cb => {
      for(const png of cb) {
        if(test[count] == png)
          alert("RIGHT")
        count++
      }
    })
  }

    // The html of the page
    return(
      <div>
        <div class="main-title">
          <h1><b>Crazy 8s</b></h1>
          
        </div>
      
        <div class="game">
          
          <div class="game-center">
            <button class="deck card-button"><img class="deck" src={require('./Cards/cardBack_red1.png')}></img></button>
            <button class="pile card-button"><img class="pile" src={require('./Cards/cardSpades5.png')}></img></button>
          </div>

          <div class="other-players">

          </div>

          {/* Creates the player's hand */}
          <div class="player-hand">
            {playerHand.map((card, index) => (
              <button class="player-hand card-button"><img key={index} src={require(`./Cards/${card}`)} alt={`Card ${index}`} /></button>
            ))}
          </div>
        </div>

      </div>
    )
  }
  
  
  export default Game