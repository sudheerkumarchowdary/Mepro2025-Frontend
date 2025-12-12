import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import API_BASE_URL from '../config';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    company: '',
    education: '',
    phone: '',
    occupation: '',
    designation: '',
    skill: '',
    cityLocation: '',
    profileImageUrl: '',
    resumeUrl: '',
    isPremium: false,
    visibilityLevel: 'standard'
  });
  const [profileImage, setProfileImage] = useState(null);
  const [resume, setResume] = useState(null);
  const [otherFiles, setOtherFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profilesList, setProfilesList] = useState([]); // For recruiters
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      alert('Please login to access your profile');
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // If recruiter, fetch all profiles; if talent, fetch their own profile
      if (userData.userType === 'recruiter') {
        fetchAllProfiles();
      } else {
        fetchProfile(token);
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/profiles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            name: data.profile.Name || '',
            email: data.profile.Email || '',
            company: data.profile.Company || '',
            education: data.profile.Education || '',
            phone: data.profile.Phone || '',
            occupation: data.profile.Occupation || '',
            designation: data.profile.Designation || '',
            skill: data.profile.Skill || '',
            cityLocation: data.profile.CityLocation || '',
            profileImageUrl: data.profile.ProfileImageUrl || '',
            resumeUrl: data.profile.ResumeUrl || '',
            isPremium: data.profile.IsPremium || false,
            visibilityLevel: data.profile.VisibilityLevel || 'standard'
          });
        }
      } else if (res.status === 404) {
        // Profile doesn't exist yet, that's okay
        console.log('No profile found, user can create one');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (file, fileType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to upload files');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    try {
      setUploadStatus(`Uploading ${fileType}...`);
      const res = await fetch(`${API_BASE_URL}/api/profiles/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus(`✅ ${fileType} uploaded successfully!`);
        
        // Update profile state with the new URL
        if (fileType === 'profileImage') {
          setProfile(prev => ({ ...prev, profileImageUrl: data.url }));
          setProfileImage(null);
        } else if (fileType === 'resume') {
          setProfile(prev => ({ ...prev, resumeUrl: data.url }));
          setResume(null);
        } else {
          // Refresh profile to get updated file list
          fetchProfile(token);
        }
      } else {
        alert(`❌ Upload failed: ${data.error || 'Unknown error'}`);
        setUploadStatus('Upload failed.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('❌ Upload failed');
      setUploadStatus('Upload failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login to save your profile');
      navigate('/login');
      return;
    }

    try {
      setUploadStatus('Saving profile...');
      const res = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        setUploadStatus('✅ Profile saved successfully!');
        
        // Upload files if selected
        if (profileImage) {
          await handleFileUpload(profileImage, 'profileImage');
        }
        if (resume) {
          await handleFileUpload(resume, 'resume');
        }
        if (otherFiles.length > 0) {
          for (const file of otherFiles) {
            await handleFileUpload(file, 'other');
          }
          setOtherFiles([]);
        }
      } else {
        alert(`❌ Save failed: ${data.error || 'Unknown error'}`);
        setUploadStatus('Save failed.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('❌ Save failed');
      setUploadStatus('Save failed.');
    }
  };

  if (loading) {
    return (
      <div className="marketplace-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
      </div>
    );
  }

  // Render profiles list for recruiters
  if (user && user.userType === 'recruiter') {
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
            <div className="nav-item active">PROFILING</div>
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
  }

  // Render profile form for talent users
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
          <div className="nav-item active">PROFILING</div>
          <div className="nav-item" onClick={() => navigate('/')}>LEARNING / CERTIFICATION</div>
          <div className="nav-item" onClick={() => navigate('/pitch-upload')}>PITCHING</div>
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

        {/* Main Content Area */}
        <main className="main-content">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              {/* Left Column */}
              <div className="form-column">
                <label>
                  NAME
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  EMAIL
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  COMPANY
                  <input
                    type="text"
                    name="company"
                    value={profile.company}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  EDUCATION
                  <input
                    type="text"
                    name="education"
                    value={profile.education}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  PHONE #
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {/* Right Column */}
              <div className="form-column">
                <label>
                  OCCUPATION
                  <input
                    type="text"
                    name="occupation"
                    value={profile.occupation}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  DESIGNATION
                  <input
                    type="text"
                    name="designation"
                    value={profile.designation}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  SKILL
                  <input
                    type="text"
                    name="skill"
                    value={profile.skill}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  CITY/LOCATION
                  <input
                    type="text"
                    name="cityLocation"
                    value={profile.cityLocation}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  PROFILE UPLOAD
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.type.startsWith('image/')) {
                          setProfileImage(file);
                        } else {
                          setResume(file);
                        }
                      }
                    }}
                  />
                  {profile.profileImageUrl && (
                    <div className="file-preview">
                      <small>Current image uploaded</small>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn">SUBMIT</button>
          </form>

          {uploadStatus && <p className="status-message">{uploadStatus}</p>}
        </main>
      </div>

      {/* Footer */}
      <footer className="marketplace-footer">
        <p>© MEESCHOOL, 2025</p>
      </footer>
    </div>
  );
};

export default ProfilePage;

