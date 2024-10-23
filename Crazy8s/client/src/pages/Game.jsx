import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";



function Game(){
    return(
      <div>
        <div class="main-title">
          <h1><b>Crazy 8s</b></h1>
          
        </div>
      
        <div class="game">

          <div class="game-center">
            <img class="deck" src={require('./Cards/cardBack_red1.png')}></img>
            <img class="pile" src={require('./Cards/cardSpades5.png')}></img>
          </div>

          <div class="other-players">

          </div>

          <div class="player-hand">
            <img src={require('./Cards/cardBack_red1.png')}></img>
          </div>
        </div>

      </div>
    )
  }
  
  
  export default Game