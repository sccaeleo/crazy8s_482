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
    <img src={require('./Cards/cardClubs8.png')}></img>
  </div>

    <div class="account-button">
      <Link to="/accountsettings">
        <button class="btn btn-lg btn-light rounded-5 float-end">A</button>
      </Link>
    </div>
    
    <div class="main-buttons">
        <Link to="/create">
        <button class="btn btn-lg btn-light">Create Game</button>
        </Link>
        <Link to="/join">
        <button class="btn btn-lg btn-light">Join Game</button>
        </Link>
        <Link to="/createaccount">
        <button class="btn btn-lg btn-light">Create Account</button>
        </Link>
    </div>
    

    </div>
  )
}


export default Homepage