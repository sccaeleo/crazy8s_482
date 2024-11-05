import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";




function JoinGame({socket}){

  var [gameList, setGameList] = useState(['test1']);

  
  useEffect(() => {

    // Update Games list every 5 sec
    updateGames();
    const intervalId = setInterval(updateGames, 5000);
    return () => clearInterval(intervalId);

  },);

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
      <h1 class="main-title"><b>Join a Game</b></h1>
        <div class = "game-list">
          
            <div class = "game-entry">
              <p><b>Game Name</b></p>
              <p><b>Host</b></p>
              <p><b>Public</b></p>
              <p><b>Buy In</b></p>
            </div>
            {gameList.map((game, index) => (
            <div class = "game-entry">
              <p>{game.room}</p>
              <p>{game.host}</p>
              <p>{game.isPublic}</p>
              <p>{game.bet}</p>
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