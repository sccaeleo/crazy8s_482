import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate } from "react-router-dom";

function Lobby({ socket }) {

    const navigate = useNavigate();
    const [playerList, setPlayerList] = useState([]);

    /**
     * Initial Setup
     */
    useEffect(() => {
        if (socket) {
            socket.emit("updatePlayers", cb => {
                setPlayerList(cb);
            });
        }

        // Cleanup on unmount
        return () => {
        socket.off('connect');
        };
    }, [socket]);

    /**
     * Go to Game.jsx
     */
    socket.on("goToGamePage", () => {
        navigate("/game");
    })

    /**
     * Update playerList with new players
     */
    socket.on("updatePlayers", list => {
        setPlayerList(list);
    })

    return(
        <>
            {/* Right Player Lobby Box*/}
            <div class = "lobby-box">
                <h1><b>Lobby</b></h1>

                <div class = "lobby-list">
                {playerList.map((player, index) => (
                    <div class = "player-entry">
                        <p>{player}</p>
                    </div>
                ))}
                </div>

            </div>
        </>
    )
}

export default Lobby