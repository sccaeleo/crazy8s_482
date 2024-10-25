import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";


function CreateGame({ socket }){

  const [socketId, setSocketId] = useState('');

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
    }
    
    // Optional: log when connected
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
    socket.emit("createGame", roomName)
  }

  return(
    <>
    <div>
      <h1>Create Game</h1>
    </div>
    <div>
      <Link to="/game">
      <button class="btn btn-lg btn-light" onClick={createGameObject}>Create Game</button>
      </Link>
    </div>
    <div class="connected-message">{socketId}</div>
    </>
  )
}
  

export default CreateGame