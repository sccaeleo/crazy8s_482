import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";
import './Home.css'


function Homepage(){
  return(
    <div>

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
        <button class="btn btn-lg btn-light btn-padding">Create Game</button>
        </Link>
        <Link to="/join">
        <button class="btn btn-lg btn-light btn-padding">Join Game</button>
        </Link>
        <Link to="/createaccount">
        <button class="btn btn-lg btn-light btn-padding">Create Account</button>
        </Link>
    </div>
    

    </div>
  )
}


export default Homepage