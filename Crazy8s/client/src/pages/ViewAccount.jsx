import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ViewAccount() {
  const [user, setUser] = useState(null);
  const [friendData, setFriendData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [friendAdd, setFriendAdd] = useState("");
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/get_user/${id}`);
        setUser(res.data);

        // Handle friends array
        if (res.data.friends && res.data.friends.length > 0) {
          const friendPromises = res.data.friends.map(async (friendRef) => {
            try {
              const friendId = friendRef._path.segments[1];
              const friendRes = await axios.get(`/get_user/${friendId}`);
              return {
                id: friendId,
                name: friendRes.data.name,
                ref: friendRef
              };
            } catch (err) {
              console.error("Error fetching friend data:", err);
              return null;
            }
          });

          const resolvedFriends = await Promise.all(friendPromises);
          setFriendData(resolvedFriends.filter(friend => friend !== null));
        }

        // Handle friend requests array
        if (res.data.friend_requests && res.data.friend_requests.length > 0) {
          const requestPromises = res.data.friend_requests.map(async (requestRef) => {
            try {
              const requesterId = requestRef._path.segments[1];
              const requesterRes = await axios.get(`/get_user/${requesterId}`);
              return {
                id: requesterId,
                name: requesterRes.data.name,
                ref: requestRef
              };
            } catch (err) {
              console.error("Error fetching requester data:", err);
              return null;
            }
          });

          const resolvedRequests = await Promise.all(requestPromises);
          setRequestData(resolvedRequests.filter(request => request !== null));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUser();
  }, [id]);

  function addFriend(e) {
    e.preventDefault();
    
    axios.post(`/add_friend/${id}`, { friendName: friendAdd })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => console.error("Error adding friend:", err));
  }

  function acceptFriend(friendId) {
    axios.post(`/accept_friend/${id}`, { friendId })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => console.error("Error accepting friend:", err));
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="main-title"><b>Your Account</b></h1>
      <Link to="/accountsettings" className="btn btn-back">
        Back
      </Link>
      
      <div className="account-view">
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

      <div className="friends">
        <h1><b>Friends List</b></h1>
        <div className="lobby-list">
          {friendData.map((friend) => (
            <div className="player-entry" key={friend.id}>
              <p>{friend.name}</p>
            </div>
          ))}
        </div>

        <h1><b>Friend Requests</b></h1>
        <div className="lobby-list">
          {requestData.map((request) => (
            <div className="player-entry" key={request.id}>
              <p>{request.name}</p>
              <button 
                className="btn btn-success" 
                onClick={() => acceptFriend(request.id)}
              >
                Accept
              </button>
            </div>
          ))}
        </div>

        <div className="add-friend-section">
          <label>Add Friend:</label>
          <input 
            type="text" 
            value={friendAdd}
            onChange={(e) => setFriendAdd(e.target.value)} 
            placeholder="Enter Friend Name" 
          />
          <button 
            className="btn btn-success" 
            onClick={addFriend}
          >
            Add
          </button>
        </div>
      </div>

      <div className="message">
      </div>
    </div>
  );
}

export default ViewAccount;