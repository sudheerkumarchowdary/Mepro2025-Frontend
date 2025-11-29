import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PitchUploadPage.css';
import API_BASE_URL from '../config';

const PitchUploadPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('User/Talent');
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchDownloadLink = async (category) => {
    try {
      const res = await fetch(`${API_BASE_URL}/latest-pitch/${category}`);
      const data = await res.json();
      if (res.ok) {
        setDownloadLink(data.url);
      } else {
        setDownloadLink('');
      }
    } catch (err) {
      console.error('Failed to fetch download link:', err);
      setDownloadLink('');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFile(null);
    setNote('');
    setUploadStatus('');
    fetchDownloadLink(category);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', selectedCategory);
    formData.append('note', note);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload a pitch');
        navigate('/login', { state: { from: '/pitch-upload' } });
        return;
      }

      // Check user type before uploading
      if (!user || user.userType !== 'talent') {
        alert('Only talent users can upload pitches');
        navigate('/login');
        return;
      }

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Pitch uploaded successfully! URL: ${data.url}`);
        setUploadStatus('Upload successful!');
        fetchDownloadLink(selectedCategory); // Refresh download link
      } else {
        const errorMsg = data.error || 'Unknown error';
        alert('❌ Upload failed: ' + errorMsg);

        // Handle specific errors
        if (res.status === 403) {
          alert('❌ Only talent users can upload pitches. Please login with a talent account.');
          navigate('/login');
        } else if (res.status === 401 || res.status === 403) {
          alert('❌ Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { state: { from: '/pitch-upload' } });
        }

        setUploadStatus('Upload failed.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Upload failed');
      setUploadStatus('Upload failed.');
    }
  };

  useEffect(() => {
    // Check if user is logged in and is talent
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      alert('Please login as a talent user to upload pitches');
      navigate('/login', { state: { from: '/pitch-upload' } });
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.userType !== 'talent') {
        alert('❌ Access Denied: Only talent users can upload pitches. Recruiters can only view pitches.');
        navigate('/producer-pitches');
        return;
      }

      setUser(userData);
      fetchDownloadLink(selectedCategory);
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
      return;
    }
  }, [navigate, selectedCategory]);

  // Don't render the form if user is not talent
  if (!user || user.userType !== 'talent') {
    return (
      <div className="pitch-upload-container">
        <button className="home-btn" onClick={() => navigate('/')}>🏠 Home</button>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <h2>❌ Access Denied</h2>
          <p>Only talent users can upload pitches.</p>
          <p>Recruiters can view pitches in the <a href="/producer-pitches" style={{ color: '#667eea' }}>Pitches Gallery</a>.</p>
          <button onClick={() => navigate('/producer-pitches')} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            View All Pitches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pitch-upload-container">
      {/* Home button */}
      <button className="home-btn" onClick={() => navigate('/')}>🏠 Home</button>

      <h1>📤 Upload Your Pitch Deck</h1>
      <p className="subtitle">Connect with industry stakeholders by submitting your proposal</p>

      <div className="category-tabs">

        <button
          className={selectedCategory === 'User/Talent' ? 'active' : ''}
          onClick={() => handleCategoryChange('User/Talent')}
        >
          👤 User/Talent
        </button>
      </div>

      {/* Show download link if available */}
      {downloadLink && (
        <div className="download-link">
          <a
            href={downloadLink}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="download-btn"
          >
            ⬇️ Download Your Last Uploaded Pitch
          </a>
        </div>
      )}

      <form className="upload-form" onSubmit={handleSubmit}>
        <label>
          Upload Pitch Deck (PDF, PPT, DOCX):
          <input
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>

        <label>
          Optional Note:
          <textarea
            placeholder="Any special message for stakeholders..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <button type="submit" className="submit-btn">Submit Pitch</button>
      </form>

      {uploadStatus && <p style={{ marginTop: '1rem' }}>{uploadStatus}</p>}
    </div>
  );
};

export default PitchUploadPage;
