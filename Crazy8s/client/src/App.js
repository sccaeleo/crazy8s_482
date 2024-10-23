// Import React components and bootstrap for easier website making
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import webpages from the pages folder
import Home from "./pages/Home"
import CreateGame from "./pages/CreateGame"
import JoinGame from "./pages/JoinGame"
import Game from "./pages/Game"
import AccountSettings from "./pages/AccountSettings"
import CreateAccount from "./pages/CreateAccount"
import Cards from "./pages/Cards/cardClubs2.png"


// App determines page routing and loads Home as homepage
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/game" element={<Game />} />
        <Route path="/accountsettings" element={<AccountSettings />} />
        <Route path="/createaccount" element={<CreateAccount />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
