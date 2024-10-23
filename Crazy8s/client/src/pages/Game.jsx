import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";



function Game(){
    return(
      <div>
        <div>
          <h1>Game</h1>
          
        </div>
      
        <div class="game">
          <img class="deck" src={require('./Cards/cardBack_red1.png')}></img>
        </div>

      </div>
    )
  }
  
  
  export default Game