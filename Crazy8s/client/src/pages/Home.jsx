import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import './Home.css';

function Homepage({socket}){

  const [socketId, setSocketId] = useState('');
  const [userName, setUserName] = useState(''); // State to store the user's name

  useEffect(() => {
    // Set socket ID when the component mounts
    if (socket) {
      setSocketId(socket.id);
    }
    
    socket.on('connect', () => {
      console.log('Connected with socket ID:', socket.id);
      setSocketId(socket.id);
    });

    // Fetch user session data on mount
    const fetchUserSession = async () => {
      try {
        const response = await axios.get('/current-user'); // Send request to get session data
        setUserName(response.data.name); // Store the user's name if authenticated
      } catch (error) {
        console.log('User not authenticated', error);
      }
    };

    fetchUserSession();

    // Cleanup on unmount
    return () => {
      socket.off('connect');
    };
  }, [socket]);
  
  return(
    <div data-testid="home-page">

    <div class="main-title">
        <h1><b>Crazy 8s</b></h1>
    </div>

  <div class="main-card">
    <img width="15%" src={require('./Cards/cardClubs8.png')}></img>
  </div>

    <div>
      <Link to="/accountsettings" data-testid="account-settings-link">
        <button class="btn btn-lg btn-light rounded-5 float-end account-button">account settings</button>
      </Link>
    </div>
    
    <div class="main-buttons">
        <Link to="/create">
        <button class="btn btn-lg btn-light btn-padding">Create Game</button>
        </Link>
        <Link to="/join">
        <button class="btn btn-lg btn-light btn-padding">Join Game</button>
        </Link>
        <Link to="/createaccount">
        <button class="btn btn-lg btn-light btn-padding">Create Account</button>
        </Link>
        <Link to="/login">
        <button class="btn btn-lg btn-light btn-padding">Login</button>
        </Link>
    </div>
    <div class="connected-message">{socketId}</div>

    {userName && (
        <div className="user-info">
          <p>Welcome, {userName}!</p> {/* Display the user's name if authenticated */}
        </div>
      )}

    </div>
  )
}


export default Homepage