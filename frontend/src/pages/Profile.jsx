import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';

const Profile = () => {
  const { userId } = useParams(); 
  const { user: currentUser } = useContext(AuthContext); 
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser?.id === parseInt(userId);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch both the user's profile and the global resources simultaneously
        const [userResponse, resourceResponse] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get('/resources')
        ]);

        setProfileData(userResponse.data.data);
        
        // Filter resources to only show items posted by this specific user
        const userItems = resourceResponse.data.data.filter(
          item => item.user_id === parseInt(userId)
        );
        setActiveListings(userItems);

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError('User not found or failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Loading profile...</div>;
  if (error) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--accent-red)' }}>{error}</div>;
  if (!profileData) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* ========================================== */}
      {/* LEFT SIDEBAR: Avatar & Personal Info       */}
      {/* ========================================== */}
      <div style={{ flex: '1 1 280px', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Avatar */}
        <div style={{
          width: '280px', height: '280px', borderRadius: '50%', backgroundColor: 'var(--card-bg)',
          border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          fontSize: '7rem', fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '0.5rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {profileData.name.charAt(0).toUpperCase()}
        </div>

        {/* Name & Tagline */}
        <div>
          <h2 style={{ fontSize: '1.75rem', lineHeight: '1.2' }}>{profileData.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Campus Contributor</p>
        </div>

        {/* Edit / Contact Button */}
        {isOwnProfile ? (
          <button style={{
            width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', 
            border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px', 
            cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s'
          }} onClick={() => navigate('/settings')}>
            Edit profile
          </button>
        ) : (
          <button style={{
            width: '100%', backgroundColor: 'var(--accent-red)', color: 'white', 
            border: 'none', padding: '0.5rem', borderRadius: '8px', 
            cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s'
          }}>
            Send Message
          </button>
        )}

        {/* Detailed Info (Like GitHub's left column details) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--text-muted)' }}>
              <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            <span>{profileData.location || 'Campus'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--text-muted)' }}>
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
            </svg>
            <a href={`mailto:${profileData.email}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{profileData.email}</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--text-muted)' }}>
              <path d="M1 2a1 1 0 0 1 1-1h2.146c.328 0 .647.117.899.324l2.091 1.72a1 1 0 0 1 .324.898l-.403 2.016a2 2 0 0 0 .809 2.054l2.127 1.517a2 2 0 0 0 2.302-.132l1.636-1.31a1 1 0 0 1 1.488.225l1.677 2.396a1 1 0 0 1-.168 1.341l-2.022 1.636a2 2 0 0 1-2.45.143L5.65 13.56a8 8 0 0 1-4.22-4.22L.07 6.89a2 2 0 0 1 .143-2.45L1.85 2.418A1 1 0 0 1 3 2.146H5z"/>
            </svg>
            <span>{profileData.phone || 'No phone added'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--text-muted)' }}>
              <path d="M1.5 1a.5.5 0 0 0-.5.5v3a.5.5 0 0 1-1 0v-3A1.5 1.5 0 0 1 1.5 0h3a.5.5 0 0 1 0 1h-3zM11 .5a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 1 16 1.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 1-.5-.5zM.5 11a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 1 0 1h-3A1.5 1.5 0 0 1 0 14.5v-3a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 .5-.5zM3 4.5a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7zm2 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-7zm3 0a.5.5 0 0 1 1 0v7a.5.5 0 0 1-1 0v-7z"/>
            </svg>
            <span>Reg: {profileData.registration_no || 'N/A'}</span>
          </div>

        </div>
      </div>

      {/* ========================================== */}
      {/* RIGHT CONTENT: Bio & Active Listings       */}
      {/* ========================================== */}
      <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Custom "README" Style About Section */}
        <div style={{
          backgroundColor: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '8px', padding: '1.5rem', marginTop: '0.5rem'
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontFamily: 'monospace' }}>
            {profileData.name.replace(/\s+/g, '').toLowerCase()} / README.md
          </p>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
            Hello, I'm {profileData.name.split(' ')[0]} 👋
          </h3>
          <p style={{ color: 'var(--text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            I am a CSE student building scalable, full-stack web applications and community platforms. 
            When I'm not studying algorithms or participating in competitive programming, I'm actively trading resources 
            and helping my peers on the CholoShareKori network.
          </p>
        </div>

        {/* "Pinned Repositories" Style Grid for Resources */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '400', marginBottom: '1rem' }}>Active Listings</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {activeListings.length > 0 ? (
              activeListings.map(resource => (
                <div key={resource.id} style={{ 
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem',
                  backgroundColor: 'var(--card-bg)', display: 'flex', flexDirection: 'column',
                  transition: 'border-color 0.2s', cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-red)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                onClick={() => navigate(`/${resource.type}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ color: 'var(--accent-red)', fontSize: '1rem', margin: 0 }}>{resource.title}</h4>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', 
                      border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-muted)' 
                    }}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {resource.description || 'No description provided.'}
                  </p>
                  
                  {/* Language/Category dot indicator similar to GitHub */}
                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getCategoryColor(resource.category) }}></div>
                    <span>{resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>This user hasn't posted any resources yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper function to color-code categories just like GitHub languages
const getCategoryColor = (category) => {
  const colors = {
    'education materials': '#f1e05a', // JavaScript Yellow
    'tools': '#e34c26',               // HTML Red
    'clothing': '#563d7c',            // CSS Purple
    'furniture': '#b07219',           // Java Orange
    'food': '#3178c6',                // TypeScript Blue
    'outdoor': '#4F5D95'              // PHP Blue
  };
  return colors[category] || '#ededed';
};

export default Profile;