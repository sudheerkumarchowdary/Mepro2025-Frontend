import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import API_BASE_URL from '../config';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    expertise: '',
    experience: '',
    skills: '',
    portfolioUrl: '',
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
      fetchProfile(token);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    }
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
            bio: data.profile.Bio || '',
            expertise: data.profile.Expertise || '',
            experience: data.profile.Experience || '',
            skills: data.profile.Skills || '',
            portfolioUrl: data.profile.PortfolioUrl || '',
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
      <div className="profile-container">
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <button className="home-btn" onClick={() => navigate('/')}>🏠 Home</button>

      <h1>👤 Create Your Professional Profile</h1>
      <p className="subtitle">Showcase your expertise and build your professional presence</p>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          
          <label>
            Name *
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              required
            />
          </label>

          <label>
            Bio
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </label>

          <label>
            Expertise
            <textarea
              name="expertise"
              value={profile.expertise}
              onChange={handleInputChange}
              placeholder="Your areas of expertise..."
              rows="3"
            />
          </label>

          <label>
            Experience
            <textarea
              name="experience"
              value={profile.experience}
              onChange={handleInputChange}
              placeholder="Your professional experience..."
              rows="4"
            />
          </label>

          <label>
            Skills
            <input
              type="text"
              name="skills"
              value={profile.skills}
              onChange={handleInputChange}
              placeholder="Comma-separated skills (e.g., Acting, Directing, Writing)"
            />
          </label>

          <label>
            Portfolio URL
            <input
              type="url"
              name="portfolioUrl"
              value={profile.portfolioUrl}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
            />
          </label>
        </div>

        <div className="form-section">
          <h2>Files & Documents</h2>

          <label>
            Profile Image
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
            />
            {profile.profileImageUrl && (
              <div className="file-preview">
                <p>Current: <a href={profile.profileImageUrl} target="_blank" rel="noopener noreferrer">View Image</a></p>
              </div>
            )}
          </label>

          <label>
            Resume/CV
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files[0])}
            />
            {profile.resumeUrl && (
              <div className="file-preview">
                <p>Current: <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">View Resume</a></p>
              </div>
            )}
          </label>

          <label>
            Other Files (Portfolio, Samples, etc.)
            <input
              type="file"
              multiple
              onChange={(e) => setOtherFiles(Array.from(e.target.files))}
            />
            {otherFiles.length > 0 && (
              <div className="file-preview">
                <p>{otherFiles.length} file(s) selected</p>
              </div>
            )}
          </label>
        </div>

        <div className="form-section">
          <h2>Profile Settings</h2>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPremium"
              checked={profile.isPremium}
              onChange={handleInputChange}
            />
            Premium Profile (Enhanced visibility)
          </label>

          <label>
            Visibility Level
            <select
              name="visibilityLevel"
              value={profile.visibilityLevel}
              onChange={handleInputChange}
            >
              <option value="standard">Standard</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>

        <button type="submit" className="submit-btn">Save Profile</button>
      </form>

      {uploadStatus && <p className="status-message">{uploadStatus}</p>}
    </div>
  );
};

export default ProfilePage;

