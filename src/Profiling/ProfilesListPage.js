import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilesListPage.css';
import API_BASE_URL from '../config';

const ProfilesListPage = () => {
  const [profilesList, setProfilesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and is recruiter
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      alert('Please login to access profiles');
      navigate('/login', { state: { from: '/profiles' } });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      
      if (userData.userType !== 'recruiter') {
        alert('Only recruiters can view profiles. Talent users can create/edit their profile.');
        navigate('/profile');
        return;
      }

      setUser(userData);
      fetchAllProfiles();
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all profiles created by users (talent)
  const fetchAllProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/profiles`);

      if (res.ok) {
        const data = await res.json();
        setProfilesList(data.profiles || []);
      } else {
        console.error('Failed to fetch profiles:', data.error);
        alert('Failed to load profiles: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
      alert('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      {/* Header */}
      <header className="marketplace-header">
        <div className="logo-left">
          <img src="/p3.jpg" alt="Cinepreneur Logo" className="cinepreneur-logo" />
        </div>
        <div className="header-content">
          <h1 className="marketplace-title">M&E MARKETPLACE</h1>
          <p className="marketplace-subtitle">EMPOWERING CREATORS, PROFESSIONALS</p>
        </div>
        <div className="logo-right">
          <img src="/p1.jpg" alt="MeeSchool Logo" className="meeschool-logo" />
        </div>
      </header>

      <div className="marketplace-body">
        {/* Left Navigation Sidebar */}
        <nav className="sidebar-nav">
          {/* Recruiters see "PROFILES" instead of "PROFILING" like users do */}
          <div className="nav-item active">PROFILES</div>
          <div className="nav-item" onClick={() => navigate('/')}>LEARNING / CERTIFICATION</div>
          <div className="nav-item" onClick={() => navigate('/producer-pitches')}>PITCHING</div>
          <div className="nav-item">
            VALIDATE
            <div className="nav-subitem">PROOF OF CONCEPTS</div>
          </div>
          <div className="nav-item">
            SOURCING
            <div className="nav-subitem">TALENT/EQUIPMENT</div>
          </div>
          <div className="nav-item" onClick={() => navigate('/')}>FUNDING ZONE</div>
        </nav>

        {/* Main Content Area - Profiles List */}
        <main className="main-content">
          <h2 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>PROFILES</h2>
          
          {profilesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              <p>No profiles found.</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {profilesList.map((profile, index) => (
                <div key={profile.Id || index} className="profile-card">
                  {profile.ProfileImageUrl && (
                    <div className="profile-image-container">
                      <img 
                        src={profile.ProfileImageUrl} 
                        alt={`${profile.Name || 'Profile'}`}
                        className="profile-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="profile-info">
                    <h3 className="profile-name">{profile.Name || 'N/A'}</h3>
                    <p className="profile-email">{profile.Email || profile.UserEmail || 'N/A'}</p>
                    {profile.Company && <p className="profile-detail"><strong>Company:</strong> {profile.Company}</p>}
                    {profile.Occupation && <p className="profile-detail"><strong>Occupation:</strong> {profile.Occupation}</p>}
                    {profile.Designation && <p className="profile-detail"><strong>Designation:</strong> {profile.Designation}</p>}
                    {profile.Skill && <p className="profile-detail"><strong>Skill:</strong> {profile.Skill}</p>}
                    {profile.CityLocation && <p className="profile-detail"><strong>Location:</strong> {profile.CityLocation}</p>}
                    {profile.Education && <p className="profile-detail"><strong>Education:</strong> {profile.Education}</p>}
                    {profile.Phone && <p className="profile-detail"><strong>Phone:</strong> {profile.Phone}</p>}
                    {profile.ResumeUrl && (
                      <a 
                        href={profile.ResumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="resume-link"
                      >
                        📄 View Resume
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="marketplace-footer">
        <p>© MEESCHOOL, 2025</p>
      </footer>
    </div>
  );
};

export default ProfilesListPage;

