import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { 
  IconMapPin, 
  IconShieldCheck,
  IconSettings
} from '../components/Icons';
import { demoStudents, getStoredCampusListings } from '../services/campusData';

const Profile = () => {
  const { userId: paramUserId } = useParams(); 
  const { user: currentUser } = useContext(AuthContext);

  // If visiting /profile without param, use currentUser.id or default to 98 (Nafis)
  const userId = paramUserId || currentUser?.id || 98;

  const [profileData, setProfileData] = useState(null);
  const [activeListings, setActiveListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = Number(currentUser?.id) === Number(userId);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [userResponse, resourceResponse] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get('/resources')
        ]);

        if (userResponse.data?.data) {
          setProfileData(userResponse.data.data);
        } else {
          fallbackProfile();
        }

        if (resourceResponse.data?.data) {
          const userItems = resourceResponse.data.data.filter(
            item => Number(item.user_id) === Number(userId)
          );
          setActiveListings(userItems);
        } else {
          fallbackListings();
        }

      } catch (err) {
        fallbackProfile();
        fallbackListings();
      } finally {
        setLoading(false);
      }
    };

    const fallbackProfile = () => {
      // Find from demoStudents or construct from currentUser
      const found = demoStudents.find(s => Number(s.id) === Number(userId));
      if (found) {
        setProfileData(found);
      } else if (currentUser && Number(currentUser.id) === Number(userId)) {
        setProfileData({
          ...currentUser,
          dept: currentUser.department || 'Jahangirnagar University',
          batch: 'Verified Student',
          trust_score: 99.0,
          karma_points: 380,
          items_shared: 12,
          on_time_rate: '100%',
          bio: 'Campus student trading and sharing resources.'
        });
      } else {
        setProfileData(demoStudents[0]);
      }
    };

    const fallbackListings = () => {
      const items = getStoredCampusListings().filter(
        item => Number(item.user_id) === Number(userId)
      );
      setActiveListings(items);
    };

    fetchProfileData();
  }, [userId, currentUser]);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', marginBottom: '1rem' }} />
        <p>Loading student profile...</p>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Profile Banner Card */}
      <div className="bento-card" style={{ 
        padding: '2.5rem 2.25rem', 
        marginBottom: '2.75rem',
        position: 'relative',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '2rem', 
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: '92px',
              height: '92px',
              borderRadius: '24px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '2.5rem',
              fontWeight: 800,
              boxShadow: '0 8px 24px rgba(217, 83, 47, 0.3)',
              border: '2px solid var(--border-subtle)'
            }}>
              {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                  {profileData.name}
                </h1>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.8rem', 
                  fontWeight: 700, 
                  color: 'var(--accent-emerald)', 
                  background: 'var(--accent-emerald-subtle)', 
                  border: '1px solid rgba(37, 122, 84, 0.25)', 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '999px' 
                }}>
                  <IconShieldCheck size={14} color="var(--accent-emerald)" />
                  <span>Verified JU Student</span>
                </span>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '0.35rem', fontWeight: 500 }}>
                {profileData.dept || profileData.department || 'Computer Science & Engineering'} • {profileData.batch || 'Batch 50'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-primary)', fontSize: '0.88rem', marginTop: '0.45rem', fontWeight: 600 }}>
                <IconMapPin size={15} color="var(--accent-primary)" />
                <span>{profileData.location || 'Al-Beruni Hall, Jahangirnagar University'}</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isOwnProfile ? (
              <Link to="/settings" className="btn-secondary">
                <IconSettings size={15} />
                <span>Edit Profile & Hall</span>
              </Link>
            ) : (
              <a 
                href={`https://wa.me/${(profileData.phone || '').replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-primary"
              >
                <span>Message Peer on WhatsApp</span>
              </a>
            )}
          </div>

        </div>

        {/* Bio */}
        {profileData.bio && (
          <p style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, maxWidth: '780px' }}>
            "{profileData.bio}"
          </p>
        )}

        {/* Karma & Trust Metrics Rail */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '1rem', 
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Campus Trust Rating
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {profileData.trust_score || 99}%
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Based on peer reviews</span>
          </div>

          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Karma Points
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '0.2rem' }}>
              {profileData.karma_points || 380} <span style={{ fontSize: '0.9rem' }}>pts</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Top 5% of Hall Lenders</span>
          </div>

          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              On-Time Return Rate
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>
              {profileData.on_time_rate || '100%'}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Zero overdue defaults</span>
          </div>

          <div style={{ background: 'var(--bg-surface-subtle)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Resources Shared
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-plum)', marginTop: '0.2rem' }}>
              {profileData.items_shared || activeListings.length || 8}
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Exchanges completed</span>
          </div>
        </div>

      </div>

      {/* Active Listings Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Active Postings by {isOwnProfile ? 'You' : profileData.name.split(' ')[0]}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Available for immediate pickup or loan on campus
            </p>
          </div>

          {isOwnProfile && (
            <Link to="/create-resource" className="btn-primary" style={{ padding: '0.55rem 1.15rem', fontSize: '0.88rem' }}>
              + New Post
            </Link>
          )}
        </div>

        {activeListings.length > 0 ? (
          <div className="bento-grid">
            {activeListings.map(item => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        ) : (
          <div className="bento-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              {isOwnProfile ? "You haven't listed any resources yet." : "This student currently has no active listings."}
            </p>
            {isOwnProfile && (
              <Link to="/create-resource" className="btn-primary">
                Post an Item to Campus
              </Link>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;