import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";


function CreateGame(){
  //Get these values when creating game and then pass them to the game
  const password = '';
  const bet = 0;

  return(
    <>
    <div>
      <h1>Create Game</h1>
    </div>
    <div>
      <Link to="/game">
      <button class="btn btn-lg btn-light">Create Game</button>
      </Link>
    </div>
    </>
  )
}
  
function initGame(password, bet) {
  
}

export default CreateGame