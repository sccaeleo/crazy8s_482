import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";


function CreateGame({ socket }){

  const [socketId, setSocketId] = useState('');
  const [gameMade, setGameMade] = useState(false);
  const [playerList, setPlayerList] = useState(['a','b','c'])

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
  const isPrivate = false;
  const password = '';
  const bet = 0;

  const createGameObject = () => {
    if(gameMade === false) {
      socket.emit("createGame", roomName)
      setGameMade(true);
    }
  }

// The html of the page
  return(
    <>
    
    {/* Left Lobby Settings Box*/}

    <div class="lobby-settings">
      <h1><b>Settings</b></h1>
    </div>

    <div>


      <button class="btn start-buttons" onClick={createGameObject}>Start Lobby</button>
      
      <Link to="/game">
      {gameMade && (<button class="btn start-buttons" >Start Game</button>)}
      </Link>

    </div>

    {/* Right Player Lobby Box*/}
    <div class = "lobby-box">
      <h1><b>Players</b></h1>

    <div class = "lobby-list">
    {playerList.map((player, index) => (
      <div class = "player-entry">
        <p>{player}</p>
        <button class="btn btn-success">Allow</button>
      </div>
    ))}
    </div>

    </div>
    
    <div class="connected-message">{socketId}</div>
    </>
  )
}
  

export default CreateGame