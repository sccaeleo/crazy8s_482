import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ViewAccount() {
  const [user, setUser] = useState(null);
  const [friendData, setFriendData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [friendAdd, setFriendAdd] = useState("");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageText, setMessageText] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

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

  function openMessageModal(friend) {
    setSelectedFriend(friend);
    setShowMessageModal(true);
  }

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      navigate("/"); // Redirect to homepage or login page after logout
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="main-title"><b>Your Account</b></h1>
      <Link to="/accountsettings" className="btn btn-back">
        Back
      </Link>

      <button className="btn btn-danger" style={{ position: "absolute", top: "10px", right: "10px" }} onClick={handleLogout}>
        Logout
      </button>
      
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
              <button 
                className="btn btn-primary"
                onClick={() => openMessageModal(friend)}
              >
                Send Message
              </button>
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

      {/* Message Modal */}
      {showMessageModal && selectedFriend && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '80%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="modal-header">
              <h2>Message {selectedFriend.name}</h2>
              <button 
                className="btn btn-danger"
                style={{ float: 'right' }}
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedFriend(null);
                  setMessageText("");
                }}
              >
                Close
              </button>
            </div>
            
            <div className="modal-body" style={{ marginTop: '20px' }}>
              <div className="message-history" style={{
                height: '300px',
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                overflow: 'auto'
              }}>
                {/* Message history would go here */}
                <p>Message history will appear here</p>
              </div>
              
              <div className="message-input">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  style={{
                    width: '100%',
                    height: '100px',
                    marginBottom: '10px',
                    padding: '10px'
                  }}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    // Message sending logic would go here
                    console.log(`Sending message to ${selectedFriend.name}: ${messageText}`);
                    setMessageText("");
                  }}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="message">
      </div>
    </div>
  );
}

export default ViewAccount;