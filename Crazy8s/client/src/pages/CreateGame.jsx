import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";


function CreateGame({ socket }) {

  const [socketId, setSocketId] = useState('');
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
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
      socket.emit("getUsername", cb => {
        setUsername(cb);
        setPlayerList([cb]);
      });
    }

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);

  const host = 'testHost';


  /**
   * Creates the game
   */
  const createGameObject = () => {
    if(gameMade === false) {
      setGameMade(true);
      // socket.emit("createGame", roomName)

      socket.emit("createGame", {
        // host: socketId,
        room,
        bet: parseFloat(bet),
        password,
        isPublic
      });
    }
  }

  const sendGamePage = () => {
    setGameMade(false);
    socket.emit("gameScreen", room);
  }

  socket.on("goToGamePage", () => {
    navigate("/game");
  })

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

      <input 
        type="checkbox" 
        checked={isPublic === false} 
        onChange={() => setIsPublic(!isPublic)} 
        />
      <p>{"Private"}</p>

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
      <button class="btn start-lobby" onClick={createGameObject} disabled = {gameMade}>Start Lobby</button>
      
      <div>
        {gameMade && (<button class="btn start-game" onClick={sendGamePage}>Start Game</button>)}
      </div>

    </div>

    {/* Right Player Lobby Box*/}
    <div class = "lobby-box">
      <h1><b>Lobby</b></h1>

    <div class = "lobby-list">
    {playerList.map((player, index) => (
      <div class = "player-entry">
        <p>{player}</p>
        <button class="btn btn-success" >Allow</button>
      </div>
    ))}
    </div>
    </div>

    {/* Banner Ad Placeholder */} 
    <Link to={'https://www.google.com'} target="_blank">
      <div
      style={{
        width: '80%',
        height: '10%',
        backgroundColor: 'white',
        border: '2px solid black',
        padding: '10px',
        textAlign: 'center',
        position: 'absolute',
        bottom: '10px',
        right: '10%',
        color: 'black'
      }}>
      Banner Ad Placeholder
      </div>
      </Link>
    
    <div class="connected-message">{socketId}</div>
    </>
  )
}
  

export default CreateGame