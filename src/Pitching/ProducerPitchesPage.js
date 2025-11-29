import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProducerPitchesPage.css';
import API_BASE_URL from '../config';

const ProducerPitchesPage = () => {
  const [pitches, setPitches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [viewingFile, setViewingFile] = useState(null);
  const navigate = useNavigate();

  const categories = ['All', 'User/Talent'];

  const fetchPitches = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === 'All'
          ? `${API_BASE_URL}/api/pitches`
          : `${API_BASE_URL}/api/pitches?category=${encodeURIComponent(selectedCategory)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setPitches(data.pitches || []);
      } else {
        console.error('Failed to fetch pitches:', data.error);
        alert('Failed to load pitches: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching pitches:', err);
      alert('Failed to load pitches');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchPitches();
  }, [fetchPitches]);


  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOnline = (e, fileUrl, fileName) => {
    e.preventDefault();
    // Use proxy endpoint to view file inline
    const proxyUrl = `${API_BASE_URL}/api/view-file?url=${encodeURIComponent(fileUrl)}`;
    setViewingFile({ url: proxyUrl, name: fileName });
  };

  const closeViewer = () => {
    setViewingFile(null);
  };

  const handleDeletePitch = async (pitchId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/pitches/${pitchId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Pitch deleted successfully!');
        // Refresh the pitches list
        fetchPitches();
      } else {
        alert('❌ Failed to delete pitch: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error deleting pitch:', err);
      alert('❌ Failed to delete pitch');
    }
  };

  return (
    <div className="producer-pitches-container">
      <button className="home-btn" onClick={() => navigate('/')}>
        🏠 Home
      </button>

      <h1>📋 All Uploaded Pitches</h1>
      <p className="subtitle">View and download all submitted pitch decks</p>

      {/* Controls */}
      <div className="controls-bar">
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="view-mode-toggle">
          <button
            className={viewMode === 'cards' ? 'active' : ''}
            onClick={() => setViewMode('cards')}
            title="Card View"
          >
            🎴 Cards
          </button>
          <button
            className={viewMode === 'table' ? 'active' : ''}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            📊 Table
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <p>Loading pitches...</p>
        </div>
      )}

      {/* Pitches List */}
      {!loading && pitches.length === 0 && (
        <div className="no-pitches">
          <p>No pitches found for {selectedCategory === 'All' ? 'any category' : selectedCategory}</p>
        </div>
      )}

      {!loading && pitches.length > 0 && (
        <>
          {viewMode === 'cards' ? (
            <div className="pitches-grid">
              {pitches.map((pitch) => (
                <div key={pitch._id} className="pitch-card">
                  <div className="pitch-header">
                    <h3>{pitch.fileName || 'Untitled Pitch'}</h3>
                    <span className="category-badge">{pitch.category || 'Uncategorized'}</span>
                  </div>

                  {pitch.note && (
                    <p className="pitch-note">{pitch.note}</p>
                  )}

                  <div className="pitch-meta">
                    <p className="upload-date">
                      📅 Uploaded: {formatDate(pitch.uploadedAt)}
                    </p>
                    {pitch.userId && (
                      <p className="uploader">
                        👤 Uploaded by: {pitch.userId.name || pitch.userId.email || 'Unknown'}
                      </p>
                    )}
                  </div>

                  <div className="pitch-actions">
                    <a
                      href={pitch.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-btn"
                    >
                      📥 Download Pitch
                    </a>
                    <button
                      onClick={(e) => handleViewOnline(e, pitch.fileUrl, pitch.fileName)}
                      className="view-btn"
                    >
                      👁️ View Online
                    </button>
                    <button
                      onClick={() => handleDeletePitch(pitch._id, pitch.fileName)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pitches-table-container">
              <table className="pitches-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Category</th>
                    <th>Note</th>
                    <th>Uploaded By</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pitches.map((pitch, index) => (
                    <tr key={pitch._id}>
                      <td>{index + 1}</td>
                      <td className="file-name-cell">
                        <strong>{pitch.fileName || 'Untitled Pitch'}</strong>
                      </td>
                      <td>
                        <span className="category-badge-small">
                          {pitch.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="note-cell">
                        {pitch.note || '-'}
                      </td>
                      <td>
                        {pitch.userId
                          ? (pitch.userId.name || pitch.userId.email || 'Unknown')
                          : 'Anonymous'}
                      </td>
                      <td>{formatDate(pitch.uploadedAt)}</td>
                      <td className="actions-cell">
                        <a
                          href={pitch.fileUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-download-btn"
                          title="Download"
                        >
                          📥
                        </a>
                        <button
                          onClick={(e) => handleViewOnline(e, pitch.fileUrl, pitch.fileName)}
                          className="table-view-btn"
                          title="View Online"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDeletePitch(pitch._id, pitch.fileName)}
                          className="table-delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Stats */}
      {!loading && pitches.length > 0 && (
        <div className="stats">
          <p>Total pitches: {pitches.length}</p>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="viewer-modal" onClick={closeViewer}>
          <div className="viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <h3>{viewingFile.name}</h3>
              <button className="close-viewer-btn" onClick={closeViewer}>
                ✕
              </button>
            </div>
            <div className="viewer-iframe-container">
              <iframe
                src={viewingFile.url}
                title={viewingFile.name}
                className="viewer-iframe"
              />
            </div>
            <div className="viewer-footer">
              <a
                href={viewingFile.url}
                download
                className="download-from-viewer-btn"
              >
                📥 Download File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProducerPitchesPage;
