import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";

function Homepage(){
  return(
    <div style={{backgroundColor:"green"}}>

    <div class=" bg-success text-white text-center">
        <h1><b>Crazy 8s</b></h1>
        <Link to="/accountsettings">
        <button class="btn btn-lg rounded-5 text-white btn-success float-end">A</button>
        </Link>
    </div>
    
    <div class="text-white text-center">
        <Link to="/create">
        <button class="btn btn-success rounded">Create Game</button>
        </Link>
        <Link to="/join">
        <button class="btn btn-success">Join Game</button>
        </Link>
        <Link to="/createaccount">
        <button class="btn btn-success">Create Account</button>
        </Link>
        <button class="btn btn-success">Tutorial</button>
    </div>
    

    </div>
  )
}


export default Homepage