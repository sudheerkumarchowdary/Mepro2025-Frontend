import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const segments = [
  {
    title: 'Profiling',
    description: 'Create professional profiles showcasing subject-matter expertise.',
    features: ['Standard & Premium features', 'Portfolio Builder', 'Visibility Tools'],
  },
  {
    title: 'Learning & Certification',
    description: 'Access courses, upskill and get certified in new domains.',
    features: ['Paid Programs', 'Track Progress', 'Category-wise Learning'],
  },
  {
    title: 'Sourcing',
    description: 'Find talent, equipment, and locations for production needs.',
    features: ['Talent Pool', 'Equipment Rental', 'Indoor/Outdoor Locations'],
  },
  {
    title: 'Funding',
    description: 'Connect with investors, producers for project funding.',
    features: ['Investor Listings', 'Submit Projects', 'Chat with Backers'],
  },
  {
    title: 'Pitching',
    description: 'Upload proposals and connect with producers and marketers.',
    features: ['Pitch Templates', 'OTT & Theatre Connections', 'Submit Decks'],
  },
  {
    title: 'Screening Stories',
    description: 'Get feedback from writers & AI tools on story viability.',
    features: ['AI ROI Analysis', 'Writer Panel Feedback', 'Genre Targeting'],
  },
];

const LandingPage = () => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check login status from localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (err) {
        setUser(null);
        setIsLoggedIn(false);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    alert('You have been logged out.');
    nav('/');
  };

  const requireLogin = (cb) => {
    if (!isLoggedIn) {
      alert('Please login to access this feature.');
      nav('/login');
      return;
    }
    if (typeof cb === 'function') {
      cb();
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return (
      user.name ||
      user.fullName ||
      user.firstName ||
      user.username ||
      user.email ||
      ''
    );
  };

  return (
    <div className="landing-container">
      <header className="hero">
        <div className="logo-container">
          <div className="logo-left">
            <img src="/p3.jpg" alt="Cinepreneur Logo" className="cinepreneur-logo" />
          </div>
          <div className="logo-right">
            <img src="/p1.jpg" alt="MeeSchool Logo" className="meeschool-logo" />
          </div>
        </div>
        <h1>🎬 Media & Entertainment Marketplace</h1>
        <p>Empowering Creators, Professionals, and Innovators</p>
        {isLoggedIn && (
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 'bold' }}>Welcome, {getUserDisplayName()}</span>
            <button className="outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
        <div className="hero-buttons">
          {!isLoggedIn && (
            <button onClick={() => nav('/login')}>Login to Get Started</button>
          )}
          <button
            className="outline"
            onClick={() => {
              if (!isLoggedIn) {
                alert('Please login to explore segments.');
                nav('/login');
              }
            }}
          >
            Explore Segments
          </button>
        </div>
      </header>

      <section className="segments">
        {segments.map((segment, index) => {
          const isPitching = segment.title === 'Pitching';
          const isProfiling = segment.title === 'Profiling';

          const handleDoubleClick = () => {
            if (isPitching) {
              requireLogin(() => {
                // Check if user is talent
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                  nav('/login', { state: { from: '/pitch-upload' } });
                  return;
                }
                try {
                  const userData = JSON.parse(storedUser);
                  if (userData.userType !== 'talent') {
                    alert('Only talent users can upload pitches. Recruiters can view pitches.');
                    nav('/producer-pitches');
                    return;
                  }
                  nav('/pitch-upload');
                } catch (err) {
                  nav('/login');
                }
              });
            } else if (isProfiling) {
              requireLogin(() => {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  try {
                    const userData = JSON.parse(storedUser);
                    // Recruiters go to profiles list, talent goes to profile form
                    if (userData.userType === 'recruiter') {
                      nav('/profiles');
                    } else {
                      nav('/profile');
                    }
                  } catch (err) {
                    nav('/profile');
                  }
                } else {
                  nav('/profile');
                }
              });
            } else {
              requireLogin();
            }
          };

          return (
            <div
              key={index}
              className="segment-card"
              onClick={handleDoubleClick}
            >
              <h2>{segment.title}</h2>
              <p>{segment.description}</p>
              <ul>
                {segment.features.map((item, i) => (
                  <li key={i}>✔️ {item}</li>
                ))}
              </ul>
              {isPitching && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    className="deep-dive"
                    onClick={(e) => {
                      e.stopPropagation();
                      requireLogin(() => {
                        const storedUser = localStorage.getItem('user');
                        if (!storedUser) {
                          nav('/login', { state: { from: '/pitch-upload' } });
                          return;
                        }
                        try {
                          const userData = JSON.parse(storedUser);
                          if (userData.userType !== 'talent') {
                            alert('Only talent users can upload pitches. Recruiters can view pitches.');
                            nav('/producer-pitches');
                            return;
                          }
                          nav('/pitch-upload');
                        } catch (err) {
                          nav('/login');
                        }
                      });
                    }}
                  >
                    Upload Pitch
                  </button>
                  <button
                    className="deep-dive"
                    onClick={(e) => {
                      e.stopPropagation();
                      requireLogin(() => {
                        nav('/producer-pitches');
                      });
                    }}
                  >
                    View All Pitches
                  </button>
                </div>
              )}
              {isProfiling && (
                <button
                  className="deep-dive"
                  onClick={(e) => {
                    e.stopPropagation();
                    requireLogin(() => {
                      nav('/profile');
                    });
                  }}
                >
                  Create/Edit Profile
                </button>
              )}
              {!isPitching && !isProfiling && (
                <button
                  className="deep-dive"
                  onClick={(e) => {
                    e.stopPropagation();
                    requireLogin();
                  }}
                >
                  Explore More
                </button>
              )}
            </div>
          );
        })}
      </section>

      <footer className="footer">
        <p>© 2025 MediaVerse. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
