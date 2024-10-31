import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link } from "react-router-dom";

function CreateLobby(){
    return(
      <div class="create-lobby-box">
          <h1>Create Lobby</h1>
          {/* Room Name */}
          {/* Set Password (If left blank, anyone will be able to join your game!*/}
      </div>
    )
  }
  
  
  export default CreateLobby