import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Outlet, Link } from "react-router-dom";
import './Home.css';

function Homepage({socket}){

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

  const test = () => {
    socket.emit("test", "TEST");
  };
  
  return(
    <div data-testid="home-page">

    <div class="main-title">
        <h1><b>Crazy 8s</b></h1>
    </div>

  <div class="main-card">
    <img width="15%" src={require('./Cards/cardClubs8.png')}></img>
  </div>

    <div>
      <Link to="/accountsettings">
        <button class="btn btn-lg btn-light rounded-5 float-end account-button">A</button>
      </Link>
    </div>
    
    <div class="main-buttons">
        <Link to="/create">
        <button class="btn btn-lg btn-light btn-padding" onClick={test}>Create Game</button>
        </Link>
        <Link to="/join">
        <button class="btn btn-lg btn-light btn-padding">Join Game</button>
        </Link>
        <Link to="/createaccount">
        <button class="btn btn-lg btn-light btn-padding">Create Account</button>
        </Link>
    </div>
    <div class="connected-message">{socketId}</div>

    </div>
  )
}


export default Homepage