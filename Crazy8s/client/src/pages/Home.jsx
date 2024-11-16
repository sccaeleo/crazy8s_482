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

      <div className="main-title">
        <h1><b>Crazy 8s</b></h1>
      </div>

      <div className="main-card">
        <img width="15%" src={require('./Cards/cardClubs8.png')} alt="Crazy 8s Card" />
      </div>

      {/* Flex container for account settings and profile buttons */}
      <div className="account-buttons">
        {/* <Link to="/accountsettings" data-testid="account-settings-link">
          <button className="btn btn-lg btn-light rounded-5 account-button">Account Settings</button>
        </Link> */}
        {userId ?(
        <Link to={`/viewaccount/${userId}`} data-testid="account-view-link">
          <button className="btn btn-lg btn-light rounded-5 account-button">Profile</button>
        </Link>
        ) : (
          <button className="btn btn-lg btn-light rounded-5" disabled>Profile</button>
        )}
      </div>

      <div className="main-buttons">
        <Link to="/create">
          <button className="btn btn-lg btn-light btn-padding">Create Game</button>
        </Link>
        <Link to="/join">
          <button className="btn btn-lg btn-light btn-padding">Join Game</button>
        </Link>
        <Link to="/createaccount">
          <button className="btn btn-lg btn-light btn-padding">Create Account</button>
        </Link>
        <Link to="/login">
          <button className="btn btn-lg btn-light btn-padding">Login</button>
        </Link>
        <Link to="https://bicyclecards.com/how-to-play/crazy-eights" target="_blank">
          <button className="btn btn-lg btn-light btn-padding">How To Play</button>
        </Link>
      </div>

      <div className="connected-message">{socketId}</div>
      


      </body>
  );
}

export default Homepage;
