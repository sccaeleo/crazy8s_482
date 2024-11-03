// Import React components and bootstrap for easier website making
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { io } from 'socket.io-client'

// Import webpages from the pages folder
import Home from "./pages/Home"
import CreateLobby from "./pages/CreateLobby"
import CreateGame from "./pages/CreateGame"
import JoinGame from "./pages/JoinGame"
import Game from "./pages/Game"
import AccountSettings from "./pages/AccountSettings"
import CreateAccount from "./pages/CreateAccount"
import ViewAccount from "./pages/ViewAccount"
import EditAccount from "./pages/EditAccount"


const socket = io('http://localhost:3030')

// App determines page routing and loads Home as homepage
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home socket={socket}/>} />
        <Route path="/lobby" element={<CreateLobby />} />
        <Route path="/create" element={<CreateGame socket={socket}/>} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/game" element={<Game socket={socket}/>} />
        <Route path="/accountsettings" element={<AccountSettings />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/viewaccount/:id" element={<ViewAccount />} />
        <Route path="/editaccount/:id" element={<EditAccount />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
