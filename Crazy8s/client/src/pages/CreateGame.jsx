import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";


function CreateGame({ socket }){

  const [socketId, setSocketId] = useState('');
  const [gameMade, setGameMade] = useState(false);

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
    }
    
    socket.on('connect', () => {
      console.log('Connected with socket ID:', socket.id);
      setSocketId(socket.id);
    });

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  //Get these values when creating game and then pass them to the game
  const roomName = 'testRoom';
  const password = '';
  const bet = 0;

  const createGameObject = () => {
    if(gameMade == false) {
      socket.emit("createGame", roomName)
      setGameMade(true);
    }
  }
  
  // const startGame = () => {
  //   const test = ["cardSpadesK.png","cardSpadesQ.png","cardSpadesJ.png","cardSpades10.png","cardSpades9.png"]
  //   var count;
  //   socket.emit("startGame", cb => {
  //     for(const png of cb) {
  //       if(test[count] != png)
  //         alert("WRONG")
  //       count++
  //     }
  //   })
  // }

// The html of the page (room name password bet bots)
  return(
    <>
    
    <div class = "start-buttons">


      <button class="btn btn-lg btn-light" onClick={createGameObject}>Start Lobby</button>
      
      <Link to="/game">
      {gameMade && (<button class="btn btn-lg btn-light" >Start Game</button>)}
      </Link>

    </div>

    <div class = "lobby-box">
      <h1 class = ""><b>Players</b></h1>

    <div class = "lobby-list">
      <div class = "player-entry">
        <p>Player</p>
        <button class="btn btn-success">Allow</button>
      </div>
    </div>

    </div>
    
    <div class="connected-message">{socketId}</div>
    </>
  )
}
  

export default CreateGame