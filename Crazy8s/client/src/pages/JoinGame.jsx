import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";


function JoinGame({socket}){

  var [gameList, setGameList] = useState([]);
  const [passwordPopup, setPasswordPopup] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {

    // Update Games list every 5 sec
    updateGames();
    const intervalId = setInterval(updateGames, 5000);
    return () => clearInterval(intervalId);

  },);

  // Updates the game list when called
  const updateGames =() => {
    socket.emit("listGames", cb => {
      setGameList(cb)
    })
  }


  // Check if game is private, if it does, prompt for password, else, let join
  const joinGame = (game, index) => {
    if(!game.isPublic){
      setPasswordPopup(true);
    }
    else{
      socket.emit("joinGame", index, cb => {
        if(cb === true) {
          navigate('/create');
        }
      })
    }
  }

  // Enter a password for the game
  const enterPassword = (game) => {
    if (password === game.password) {
      socket.emit("joinGame", game);
      setPasswordPopup(false);
      setPassword('');
    } else {
      alert('Incorrect Password');
    }
  };
  
  // Close the popup
  const closePasswordPopup = () => {
    setPasswordPopup(false);
    setPassword('');
  };

  return(
    <div data-testid = "join-game">
      <h1 class="main-title"><b>Join a Game</b></h1>
        <div class = "game-list">

            {/* Column Headings */}
            <div class = "game-entry">
              <p><b>Game Name</b></p>
              <p><b>Host</b></p>
              <p><b>Players</b></p>
              <p><b>Public</b></p>
              <p><b>Buy In</b></p>
            </div>

            {/* List the games */}
            {gameList.map((game, index) => (
            <div class = "game-entry">
              <p>{game.room}</p>
              <p>{game.host}</p>
              <p>{game.players.length + "/4"}</p>
              <p>{game.isPublic ? 'Yes' : 'No'}</p>
              <p>{game.bet}</p>
              <button class="join-button btn" onClick={() => joinGame(game, index)}>
                Join
              </button>
            </div>
            ))}
          
        </div>

        {/* Password Popup */}
        {passwordPopup && (
          <div className="password-popup">
            <div className="password-enter">
              <h1>Enter Game Password</h1>
                <input
                  type="password"
                  value={password}
                  onChange={(i) => setPassword(i.target.value)}
                  placeholder="Password"
                />
              <button class="btn join-button" onClick={enterPassword}>Submit</button>
              <button class="btn join-button" onClick={closePasswordPopup}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
  
  
  export default JoinGame