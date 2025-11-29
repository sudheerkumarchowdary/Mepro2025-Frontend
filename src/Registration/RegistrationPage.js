import React, { useState } from 'react';
import './RegistrationPage.css';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    name: '',  // changed from fullName
    email: '',
    password: '',
    userType: '',
    termsAccepted: false,
  });
  
  const nav=useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.termsAccepted) {
      alert('Please accept the terms and conditions.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Registration successful!');
        console.log('User saved:', data);
        nav('/login');
      } else {
        alert(`❌ Registration failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Registration failed due to network/server error.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Your Account</h2>
        <p>Join the Media & Entertainment Marketplace</p>
        <form onSubmit={handleSubmit}>
        <label>Full Name</label>
<input
  type="text"
  name="name" // changed from fullName
  required
  placeholder="John Doe"
  value={formData.name}
  onChange={handleChange}
/>


          <label>Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="********"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Select User Type</label>
<select
  name="userType"
  required
  value={formData.userType}
  onChange={handleChange}
>
  <option value="">-- Select User Type --</option>
  <option value="recruiter">Recruiter</option>
  <option value="talent">Talent</option>
</select>


          <div className="checkbox">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <label>I agree to the terms & conditions</label>
          </div>

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
