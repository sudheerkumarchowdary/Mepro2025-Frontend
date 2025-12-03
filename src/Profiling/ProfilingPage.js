import React, { useEffect, useState } from 'react';
import './ProfilingPage.css';
import { useNavigate } from 'react-router-dom';

const ProfilingPage = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      alert('Please login to access Profiling.');
      nav('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch {
      nav('/login');
    }
  }, [nav]);

  return (
    <div className="profiling-container">
      {/* Header */}
      <header className="profiling-header">
        <div className="profiling-header-left">
          <div className="logo-placeholder">Logo</div>
        </div>
        <div className="profiling-header-center">
          <h1>M &amp; E Marketplace</h1>
          <p>Empowering creators, professionals</p>
        </div>
        <div className="profiling-header-right">
          <div className="logo-placeholder">Logo</div>
        </div>
      </header>

      <div className="profiling-layout">
        {/* Left Sidebar Menu */}
        <aside className="profiling-sidebar">
          <h2>Menu</h2>
          <ul>
            <li className="active">Profiling</li>
            <li>Learning / Certification</li>
            <li>Pitching</li>
            <li>Validate – Proof of Concepts</li>
            <li>Sourcing – Talent / Equipment</li>
            <li>Funding Zone</li>
          </ul>
        </aside>

        {/* Main Content / Form */}
        <main className="profiling-main">
          <h2>Profiling</h2>
          {user && (
            <p className="profiling-welcome">
              Logged in as <strong>{user.name || user.fullName || user.email}</strong>
            </p>
          )}
          <form className="profiling-form">
            <div className="form-row">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>
            <div className="form-row">
              <label>Occupation / Designation</label>
              <input type="text" placeholder="e.g., Producer, Actor, Editor" />
            </div>
            <div className="form-row">
              <label>Company</label>
              <input type="text" placeholder="Company / Studio name" />
            </div>
            <div className="form-row">
              <label>Skill</label>
              <input type="text" placeholder="Primary skills" />
            </div>
            <div className="form-row">
              <label>Education</label>
              <input type="text" placeholder="Highest qualification" />
            </div>
            <div className="form-row">
              <label>City / Location</label>
              <input type="text" placeholder="City / Country" />
            </div>
            <div className="form-row">
              <label>Phone #</label>
              <input type="tel" placeholder="Contact number" />
            </div>
            <div className="form-row">
              <label>Profile Upload</label>
              <input type="file" />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="back-btn"
                onClick={() => nav('/home')}
              >
                ⬅ Back to Home
              </button>
              <button type="submit" className="submit-btn">
                Submit
              </button>
            </div>
          </form>
        </main>
      </div>

      {/* Footer */}
      <footer className="profiling-footer">
        © MEESCHOOL, 2025
      </footer>
    </div>
  );
};

export default ProfilingPage;


