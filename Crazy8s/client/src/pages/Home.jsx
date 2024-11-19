import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import './Home.css';

function Homepage({ socket }) {
  const [socketId, setSocketId] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (socket) {
      setSocketId(socket.id);
    }

    socket.on('connect', () => {
      console.log('Connected with socket ID:', socket.id);
      setSocketId(socket.id);
    });

    const fetchUserSession = async () => {
      try {
        const response = await axios.get('/current-user');
        setUserName(response.data.name);
        setUserId(response.data.id);
      } catch (error) {
        console.log('User not authenticated', error);
      }
    };

    fetchUserSession();

    return () => {
      socket.off('connect');
    };
  }, [socket]);

  return (
    <body>

      {/* Main Logo */}
      <div>
        <video className="main-card" width="40%" height="80%" autoPlay muted playsInline>
          <source src={require('./Cards/logo.mp4')} type="video/mp4" />
        </video>
      </div>

      {/* Flex container for option buttons*/}
      <div className="account-buttons">
        {/* <Link to="/accountsettings" data-testid="account-settings-link">
          <button className="btn btn-lg btn-light rounded-5 account-button">Account Settings</button>
        </Link> */}
        {userId ?(
        <Link to={`/viewaccount/${userId}`} data-testid="account-view-link">
          <button className="btn custom-btn account-button">Profile</button>
        </Link>
        ) : (
          <Link to="/login">
          <button className="btn custom-btn account-button">Log in!</button>
          </Link>
        )}
      </div>
      <div className="main-buttons">
        <Link to="/create">
          <button className="btn main-button custom-btn"><b>Create Game</b></button>
        </Link>
        <Link to="/join">
          <button className="btn main-button custom-btn"><b>Join Game</b></button>
        </Link>
        <Link to="https://bicyclecards.com/how-to-play/crazy-eights" target="_blank">
          <button className="btn main-button custom-btn"><b>How To Play</b></button>
        </Link>
      </div>

      {/* Company Logo */}
      <div
      style={{
        padding: '10px',
        textAlign: 'center',
        position: 'absolute',
        top: '10px',
        left: '2%',
        color: 'white'
      }}>
      <h1><b>XYZ Enterprises</b></h1>
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


      <div className="connected-message">{socketId}</div>
      


      </body>
  );
}

export default Homepage;

