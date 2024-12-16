import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";


function CreateGame({ socket }) {

  const navigate = useNavigate();

  const [gameMade, setGameMade] = useState(false);
  const [playerList, setPlayerList] = useState([]);
  const [username, setUsername] = useState(false);

  const [room, setRoom] = useState('');
  const [bet, setBet] = useState('');
  const [password, setPassword] = useState('');
  const [isPublic, setIsPublic] = useState(true);


  /**
   * Initial Setup
   */
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socket.off('goToGamePage');
      socket.off('updatePlayers')
    };
  }, [socket]);

  // ---------------------------------------- Server to Client ----------------------------------------

  /**
   * Send to Game.jsx
   */
  socket.on("goToGamePage", () => {
    navigate("/game");
  })

  /**
   * Update playerList with new players
   */
  socket.on("updatePlayers", list => {
    setPlayerList(list);
  })

  // ---------------------------------------- Client to Server ----------------------------------------

  /**
   * Creates the game
   */
  const createGameObject = () => {
    if(gameMade === false) {
      setGameMade(true);

      socket.emit("createGame", {
        room,
        bet: parseFloat(bet),
        password,
        isPublic
      });

      socket.emit("getUsername", cb => {
        setUsername(cb);
        setPlayerList([cb]);
      });
    }
  }

  /**
   * Go to Game.jsx
   */
  const sendGamePage = () => {
    setGameMade(false);
    socket.emit("gameScreen", room);
  }
// The html of the page
  return(
    <>
    
    {/* Left Lobby Settings Box*/}

    <div class="lobby-settings">
      <h1><b>Lobby Settings</b></h1>
      
      <div>
        <label>Room Name:</label>
        <input 
          type="text" 
          value={room} 
          onChange={(i) => setRoom(i.target.value)} 
          placeholder="Enter Room Name" 
        />
      </div>

      <div>
        <label>Buy-In:</label>
        <input 
          type="number" 
          value={bet} 
          onChange={(i) => setBet(i.target.value)} 
          placeholder="Enter Buy-In" 
        />
      </div>

      <div>
      <label>{"Private"}</label>
      <input 
        type="checkbox" 
        checked={isPublic === false} 
        onChange={() => setIsPublic(!isPublic)} 
        />
      </div>
      
      <div>
        <label>Password:</label>
        <input 
          type="password" 
          value={password} 
          onChange={(i) => setPassword(i.target.value)} 
          placeholder="Enter Password" 
          disabled={isPublic === true}
        />
      </div>


    </div>

    <div class = "create-game-buttons">
      <button class="btn start-lobby custom-btn" onClick={createGameObject} disabled = {gameMade}>Start Lobby</button>
      
      <div>
        {gameMade && (<button class="btn start-game custom-btn" onClick={sendGamePage}>Start Game</button>)}
      </div>

    </div>

    {/* Right Player Lobby Box*/}
    <div class = "lobby-box">
      <h1><b>Lobby</b></h1>

    <div class = "lobby-list">
    {playerList.map((player, index) => (
      <div class = "player-entry">
        <p>{player}</p>
      </div>
    ))}
    </div>
    </div>

    {/* Banner Ad Placeholder */} 
    <Link to={'https://www.google.com'} target="_blank">
      <div
      style={{
        width: '40%',
        height: '10%',
        backgroundColor: 'white',
        border: '2px solid black',
        padding: '10px',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        right: '5%',
        color: 'black'
      }}>
      Banner Ad Placeholder
      </div>
      </Link>
    </>
  )
}
  

export default CreateGame