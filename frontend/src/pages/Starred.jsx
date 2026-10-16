import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import { IconStar, IconStarFilled, IconSparkles } from '../components/Icons';
import { 
  getStoredCampusListings, 
  getStoredStarredIds, 
  toggleStoredStar 
} from '../services/campusData';

const Starred = () => {
  const [starredItems, setStarredItems] = useState([]);
  const [allListings, setAllListings] = useState([]);

  const loadStarred = () => {
    const listings = getStoredCampusListings();
    setAllListings(listings);
    const starredIds = getStoredStarredIds();
    const filtered = listings.filter(item => starredIds.includes(Number(item.id)));
    setStarredItems(filtered);
  };

  useEffect(() => {
    loadStarred();
    window.addEventListener('storage', loadStarred);
    window.addEventListener('csk_starred_updated', loadStarred);
    return () => {
      window.removeEventListener('storage', loadStarred);
      window.removeEventListener('csk_starred_updated', loadStarred);
    };
  }, []);

  const handleQuickStar = (id) => {
    toggleStoredStar(id);
    loadStarred();
    window.dispatchEvent(new Event('csk_starred_updated'));
  };

  const samplePopular = allListings.slice(0, 3);

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-amber)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
          <IconStarFilled size={14} color="var(--accent-amber)" />
          <span>Your Bookmarked Resources</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Starred Campus Items
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
          Quickly access saved study gear, tools you plan to borrow, and listings you're considering.
        </p>
      </div>

      {starredItems.length > 0 ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem' }}>
            <span style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              You have <strong>{starredItems.length}</strong> saved {starredItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="bento-grid">
            {starredItems.map(item => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Empty State */}
          <div className="bento-card" style={{ textAlign: 'center', padding: '3.75rem 2rem', marginBottom: '3rem' }}>
            <div style={{ 
              width: '58px', 
              height: '58px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--accent-amber-subtle)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.35rem' 
            }}>
              <IconStar size={28} color="var(--accent-amber)" />
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              No starred items yet
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.95rem', lineHeight: 1.55 }}>
              Tap the star icon on any textbook, calculator, or lab coat to save it here for fast access later.
            </p>
            <Link to="/buy" className="btn-primary">
              Browse Marketplace Items
            </Link>
          </div>

          {/* Quick Suggestions to Star */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.35rem' }}>
              <IconSparkles size={16} color="var(--accent-primary)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Popular Essentials You Can Bookmark
              </h3>
            </div>
            <div className="bento-grid">
              {samplePopular.map(item => (
                <div key={item.id} className="bento-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className={`badge badge-${item.listing_type}`} style={{ marginBottom: '0.75rem' }}>
                      {item.listing_type}
                    </span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      📍 {item.location} • By {item.user_name}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleQuickStar(item.id)} 
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    <IconStar size={14} color="var(--accent-amber)" />
                    <span>Bookmark This Item</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Starred;
