import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ViewAccount() {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const {friendAdd, setFriendAdd} = useState();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/get_user/${id}`);
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  function addFriend(friend){
    friend.preventDefault()

    axios.post(`/add_friend${id}`, friend)
    .catch((err)=>console.log(err))
  }

  function acceptFriend(friend){
    axios.post(`/accept_friend${id}`, friend)
    .catch((err)=>console.log(err))
  }

  return (
    <div>
      <h1 class="main-title"><b>Your Account</b></h1>
      <Link to="/accountsettings" className="btn btn-back">
        Back
      </Link>
      
      <div class= "account-view">
        <ul className="list-group">
          <li className="list-group-item">
            <b>Name: </b>
            {user.name}
          </li>
          <li className="list-group-item">
           <b>Email: </b>
           {user.email}
          </li>
          <li className="list-group-item">
           <b>Id: </b>
           {id}
          </li>
          <li className="list-group-item">
           <b>Balance: </b>
           {user.balance}
          </li>
        </ul>
      </div>

      <div class="friends">
        <h1><b>Friend List</b></h1>

        <div class = "lobby-list">
          {user.friends.map((friend, index) => (
            <div class = "player-entry">
            <p>{friend}</p>
            <button class="btn btn-success" onClick={() => acceptFriend(friend)}>Accept</button>
            </div>
          ))}
        </div>

        <label>Add Friend:</label>
        <input 
          type="text" 
          onChange={(i) => setFriendAdd(i.target.value)} 
          placeholder="Enter Friend Name" 
        />
        <button class="btn btn-success" onClick={() => addFriend(friendAdd)}>Add</button>

      </div>


      <div class="message">

      </div>

    </div>
  );
}

export default ViewAccount;