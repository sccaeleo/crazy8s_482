import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";



function JoinGame({socket}){

  var [gameList, setGameList] = useState(['test1','test2','test3']);

  const joinGame =() => {
  }

  return(
    <div>
      <h1 class="main-title">Join a Game</h1>
        <div class = "game-list">
          
            
            {gameList.map((game, index) => (
            <div clas = "game-entry">
              <p>Game</p>
              <button class="join-button" onClick={() => joinGame(index)}>
                join
              </button>
            </div>
            ))}
          
        </div>
    </div>
  )
}
  
  
  export default JoinGame