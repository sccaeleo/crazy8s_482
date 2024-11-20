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
  const [messageHistory, setMessageHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportUsername, setReportUsername] = useState('');
  const [reportIssue, setReportIssue] = useState('');

  
  const { id } = useParams();
  const navigate = useNavigate();

  /**
   * Gets data of current user from current session 
   */

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`/get_user/${id}`);
      setUser(res.data);
      
      // Set friend data directly from the user object
      if (res.data.friends && Array.isArray(res.data.friends)) {
        setFriendData(res.data.friends);
      }

      // Set request data directly from the user object
      if (res.data.friend_requests && Array.isArray(res.data.friend_requests)) {
        setRequestData(res.data.friend_requests);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };


  const fetchReports = async () => {
    try {
      const response = await axios.get('/reports');
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    if (!reportUsername.trim() || !reportIssue.trim()) {
      alert('Please fill in both fields');
      return;
    }
  
    try {
      await axios.post('/report', {
        username: reportUsername,
        issue: reportIssue
      });
      alert('Report submitted successfully');
      setShowReportModal(false);
      setReportUsername('');
      setReportIssue('');
    } catch (err) {
      console.error("Error submitting report:", err);
      alert('Error submitting report');
    }
  };

  const handleReport = async (reportId) => {
    try {
      await axios.delete(`/reports/${reportId}`);
      fetchReports(); // Refresh the reports list
      alert('Report handled successfully');
    } catch (err) {
      console.error("Error handling report:", err);
      alert('Error handling report. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchReports();
  }, [id]);

  /**
   * Send a friend request
   * @param {*} friendId - Id of user to be added
   */
  function addFriend(event) {
    event.preventDefault(); // Literally was just this line being prevent default for friendId LMAO, fixed lol

    if (!friendAdd.trim()) {
      alert("Please enter a valid friend's name.");
      return;
    }
    console.log('Sending friendName:', friendAdd);
    
    try {
      axios.post(`/add_friend/${id}`, { friendName: friendAdd })
        .then(response => {
          alert('Friend request sent successfully');
          setFriendAdd('');
        })
        .catch(error => {
          alert(error.response.data.message || 'Error sending friend request');
        });
    } catch (err) {
      alert('Error sending friend request');
    }
  }

  /**
   * Accept a friend request
   * @param {*} friendId - Id of user to be added
   */
  function acceptFriend(friendId) {
    axios.post(`/accept_friend/${id}`, { friendId })
      .then(response => {
        fetchUserData();
        alert('Friend added successfully');
      })
      .catch(error => {
        alert(error.response.data.message || 'Error accepting friend request');
      });
  }

  /**
   * Opens the messaging window
   * @param {*} friend - selected friend to message
   */
  function openMessageModal(friend) {
    setSelectedFriend(friend);
    setShowMessageModal(true);
    fetchMessageHistory(friend.id);
  }

  /**
   * Fetch message history for the selected friend
   * @param {*} friendId - ID of the friend
   */
  const fetchMessageHistory = async (friendId) => { 
    try {
      const conversationId = [id, friendId].sort().join('_');; 
      const response = await axios.get(`/conversations/${conversationId}/messages`); 
      setMessageHistory(response.data); 
    } catch (error) {
      console.error("Error loading message history:", error);
    }
  };

  async function sendMessage() {
    if (!messageText.trim()) {
      alert("Message cannot be empty!");
      return;
    }
  
    try {
      const conversationId = [id, selectedFriend.id].sort().join("_"); // Create a unique conversation ID
      const messageData = {
        senderId: id,
        recipientId: selectedFriend.id,
        content: messageText.trim(),
      };
  
      await axios.post(`/conversations/${conversationId}/messages`, messageData);
  
      // Refresh the message history after sending the message
      fetchMessageHistory(selectedFriend.id);
  
      setMessageText("");
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  }
  

  

  /**
   * axios to logout function, nav to home after logout
   */

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


      <button className="btn btn-primary" style={{ position: "absolute", top: "10px", left: "10px" }} onClick={() => navigate('/')}>
        Back
        </button>

      <button className="btn btn-warning" style={{ position: "absolute", top: "10px", right: "120px" }} onClick={() => setShowReportModal(true)}>
        Report Player
        </button>

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
          <li className="list-group-item">
           <b>Games Played: </b>
           {user.games_played}
          </li>
          <li className="list-group-item">
           <b>Wins: </b>
           {user.wins}
          </li>
          <li className="list-group-item">
           <b>Losses: </b>
           {user.losses}
          </li>
        </ul>
        {user.isAdmin && (
          <div className="admin-panel mt-3">
            <h4>Admin Panel</h4>
            <button 
              className="btn btn-danger"
              onClick={() => navigate('/accountsettings')}
            >
              Player Accounts
            </button>
            
            <h5>Player Reports</h5>
            <div className="lobby-list">
              {reports.map((report) => (
                <div className="player-entry" key={report.id}>
                  <div>
                    <strong>Reported Player: </strong> {report.username}
                  </div>
                  <div>
                    <strong>Issue: </strong> {report.issue}
                  </div>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => {
                      axios.delete(`/reports/${report.id}`)
                        .then(() => {
                          fetchReports(); // Refresh reports after deletion
                          alert('Report handled and removed');
                        })
                        .catch(err => {
                          console.error("Error deleting report:", err);
                          alert('Error removing report');
                        });
                    }}
                  >
                    Mark as Handled
                  </button>
                </div>
              ))}
              {reports.length === 0 && (
                <p>No active reports</p>
              )}
            </div>
          </div>
        )}
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
            onChange={(i) => setFriendAdd(i.target.value)} 
            placeholder="Enter Name of Player" 
          />
          <button 
            className="btn btn-success" 
            onClick={addFriend}
          >
            Add
          </button>
        </div>
      </div>

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
                  setMessageHistory([])
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
                {messageHistory.length > 0 ? (
                  messageHistory.map((message) => (
                    <div key={message.id}>
                      <strong>{message.senderId}:</strong> {message.content} <br />
                      <small>{new Date(message.timestamp.seconds * 1000).toLocaleString()}</small> {/* CHANGED HERE */}
                    </div>
                  ))
                ) : (
                  <p>No messages found.</p>
                )}
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
                  onClick={sendMessage}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

{showReportModal && (
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
      maxWidth: '500px'
    }}>
      <h2>Report Player</h2>
      <form onSubmit={submitReport}>
        <div style={{ marginBottom: '15px' }}>
          <label>Player Username:</label>
          <input 
            type="text" 
            className="form-control"
            value={reportUsername}
            onChange={(e) => setReportUsername(e.target.value)}
            placeholder="Enter player's username"
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Issue:</label>
          <textarea 
            className="form-control"
            value={reportIssue}
            onChange={(e) => setReportIssue(e.target.value)}
            placeholder="Describe the issue"
            rows="3"
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>
            Submit Report
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => {
              setShowReportModal(false);
              setReportUsername('');
              setReportIssue('');
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      <div className="message">
      </div>
    </div>
  );
}

export default ViewAccount;