import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";

function CreateGame(){
    return(
      <>
      <div>
        <h1>Create Game</h1>
      </div>
      <div>
        <Link to="/game">
        <button class="btn btn-lg btn-light">Create Game</button>
        </Link>
      </div>
      </>
    )
  }
  
  
  export default CreateGame