import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";



function JoinGame({socket}){

  var [gameList, setGameList] = useState(['test1','test2','test3']);

  const updateGames =() => {
    socket.emit("listGames", cb => {
      setGameList(cb)
    })
  }

  const joinGame =(game) => {
    // Check if game is private, if it does, prompt for password


    // join game
    socket.emit("joinGame", game)
  }

  return(
    <div data-testid = "join-game">
      <h1 class="main-title">Join a Game</h1>
        <div class = "game-list">
          
            
            {gameList.map((game, index) => (
            <div class = "game-entry">
              <p>Game Name</p>
              <p>Game ID</p>
              <p>Private/Public</p>
              <p>Buy In</p>
              <button class="join-button btn" onClick={() => joinGame(game)}>
                join
              </button>
            </div>
            ))}
          
        </div>
    </div>
  )
}
  
  
  export default JoinGame