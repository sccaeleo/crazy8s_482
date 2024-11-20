import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";


function JoinGame({socket}){

  var [gameList, setGameList] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [passwordPopup, setPasswordPopup] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  
  useEffect(() => {

    // Update Games list every 5 sec
    updateGames();
    const intervalId = setInterval(updateGames, 5000);
    return () => clearInterval(intervalId);

  },);

  
  /**
   * Updates the game list when called
   */
  const updateGames =() => {
    socket.emit("listGames", cb => {
      setGameList(cb)
    })
  }



  /**
   * Join a selected game, prompt password if private
   * @param {*} game - Game to join
   * @param {number} index - index of the game in the gamesList array
   */
  const joinGame = (game, index) => {
    if(!game.isPublic){
      setSelectedGame(game);
      setSelectedIndex(index);
      setPasswordPopup(true);
    }
    else{
      socket.emit("joinGame", index, cb => {
        if(cb === true) {
          navigate('/lobby');
        }
      })
    }
  }

  /**
   * Enter a password for the game
   * @param {*} game - Private game that someone is trying to join
   */
  const enterPassword = (game, index) => {
    if (password === game.password) {
      socket.emit("joinGame", index, cb => {
        if(cb === true) {
          navigate('/lobby');
        }
      })
      setPasswordPopup(false);
      setPassword('');
    } else {
      alert('Incorrect Password');
    }
  };
  
  /**
   * Close the password popup if you change your mind
   */
  const closePasswordPopup = () => {
    setPasswordPopup(false);
    setPassword('');
  };

  return(
    <div>
      <h1 class="main-title"><b>Join a Game</b></h1>
        <div class = "game-list" data-testid="game-list">

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
              <p>{game.roomName}</p>
              <p>{game.host}</p>
              <p>{game.players.length + "/5"}</p>
              <p>{game.isPublic ? 'Yes' : 'No'}</p>
              <p>{game.bet}</p>
              <button class="join-button btn custom-btn" data-testid="join-button" onClick={() => joinGame(game, index)}>
                <b>Join</b>
              </button>
            </div>
            ))}
        </div>

        {/* Password Popup */}
        {passwordPopup && (
          <div className="password-popup" data-testid = "password-popup">
            <div className="password-enter">
              <h1 data-testid = "password-enter">Enter Game Password</h1>
                <input
                  type="password"
                  data-testid = "password-input"
                  value={password}
                  onChange={(i) => setPassword(i.target.value)}
                  placeholder="Password"
                />
              <button class="btn join-button" onClick={() => enterPassword(selectedGame, selectedIndex)}>Submit</button>
              <button class="btn join-button" onClick={closePasswordPopup}>Cancel</button>
          </div>
        </div>
      )}

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
    </div>
  )
}
  
  
  export default JoinGame