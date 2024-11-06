import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  /**
   * Attempt Log in to page
   * @param {*} e - form submitted
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    try {
      // Make the POST request to the /login endpoint
      const response = await axios.post('/login', { email, password });

      if (response.status === 200) {
        // Clear any error messages and navigate to the dashboard or home
        setError(null);
        navigate('/'); // Adjust this path as needed
      }
    } catch (err) {
      // Handle errors and display a message
      setError('Invalid email or password');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="text"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group mt-3">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-danger mt-3">{error}</p>}

        <button type="submit" className="btn btn-primary mt-4">Login</button>
      </form>
    </div>
  );
};

export default Login;
