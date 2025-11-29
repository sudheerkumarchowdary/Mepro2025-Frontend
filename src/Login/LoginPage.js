import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate} from 'react-router-dom';
import { toast } from "react-toastify";
import API_BASE_URL from '../config';
const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const nav = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is ok first
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { message: `Login failed with status ${response.status}` };
        }
        console.error('Login failed:', errorData);
        alert(errorData.message || 'Login failed');
        return;
      }

      // Parse response
      let data;
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('Raw response text:', responseText);
        console.log('Response headers:', [...response.headers.entries()]);
        data = JSON.parse(responseText);
        console.log('Parsed data:', data);
        console.log('Data keys:', Object.keys(data));
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        console.error('Response text was:', responseText);
        alert('Invalid response from server. Please try again.');
        return;
      }

      console.log('Login response:', data); // Debug log
      console.log('Token in response:', data.token ? 'Present' : 'Missing');
      console.log('Token value:', data.token);
      console.log('User in response:', data.user ? 'Present' : 'Missing');
      console.log('Full data object:', JSON.stringify(data, null, 2));

      toast('Login successful!');
      console.log('User:', data.user);

      // Check for token in various possible formats
      const token = data.token || data.accessToken || data.access_token || data.authToken;

      // Store token in localStorage
      if (token) {
        localStorage.setItem('token', token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        console.log('Token stored successfully');
        console.log('Token value (first 20 chars):', token.substring(0, 20));

        // Verify token was stored
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          console.log('Token verified in localStorage');
        } else {
          console.error('Token storage failed!');
          alert('Failed to store token. Please try again.');
          return;
        }
      } else {
        console.error('No token received from server.');
        console.error('Available keys in response:', Object.keys(data));
        console.error('Full response:', JSON.stringify(data, null, 2));
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);

        // Try to see if there's any error in the response
        if (data.error || data.message) {
          console.error('Response error/message:', data.error || data.message);
        }

        alert('Login successful but no token received. Please check console for details and contact support.');
        return;
      }

      // Redirect to home page after login
      console.log('✅ Login successful, redirecting to home page...');
      // Use replace to prevent going back to login page
      // Force navigation with window.location as fallback
      try {
        nav('/home', { replace: true });
      } catch (navError) {
        console.error('Navigation error, using window.location:', navError);
        window.location.href = '/home';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong! Please check console for details.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Login to your account</p>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={credentials.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="********"
            value={credentials.password}
            onChange={handleChange}
          />

          <button type="submit">Login</button>
          <div className="login-footer">
            <span>Don't have an account? </span>
            <a href="/register">Register here</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
