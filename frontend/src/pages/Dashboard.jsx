import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ResourceCard from '../components/ResourceCard';
import { 
  IconSearch, 
  IconPlus, 
  IconX,
  IconSparkles,
  IconMapPin,
  IconShieldCheck
} from '../components/Icons';
import { 
  getStoredCampusListings, 
  campusPulseEvents, 
  campusStats 
} from '../services/campusData';

const campusCategories = [
  { id: 'all', label: 'All Items', icon: '✨' },
  { id: 'education materials', label: 'Books & Notes', icon: '📚' },
  { id: 'tools', label: 'Tech & Instruments', icon: '💻' },
  { id: 'clothing', label: 'Lab Coats & Wear', icon: '🥼' },
  { id: 'outdoor', label: 'Cycles & Sports', icon: '🚲' },
  { id: 'furniture', label: 'Hall Living', icon: '🛋️' }
];

const campusHotspots = [
  'All Spots',
  'TSC',
  'Bottola',
  'Central Library',
  'Science Faculty',
  'Al-Beruni Hall',
  'Pritilata Hall',
  'Shaheed Rafiq-Jabbar Hall'
];

const Dashboard = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedListingType, setSelectedListingType] = useState('all'); // all | sell | lend | free
  const [selectedSpot, setSelectedSpot] = useState('All Spots');
  const [activePulseIndex, setActivePulseIndex] = useState(0);

  // Pulse ticker animation cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePulseIndex(prev => (prev + 1) % campusPulseEvents.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const loadResources = async () => {
    try {
      const res = await api.get('/resources');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setResources(res.data.data);
      } else {
        setResources(getStoredCampusListings());
      }
    } catch (err) {
      setResources(getStoredCampusListings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
    window.addEventListener('storage', loadResources);
    return () => window.removeEventListener('storage', loadResources);
  }, []);

  const filteredItems = resources.filter(item => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.user_name && item.user_name.toLowerCase().includes(q));

    // Category match
    const matchesCat = selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();

    // Listing type match
    const matchesType = selectedListingType === 'all' || item.listing_type === selectedListingType;

    // Spot match
    const matchesSpot = selectedSpot === 'All Spots' || 
      (item.location && item.location.toLowerCase().includes(selectedSpot.toLowerCase())) ||
      (item.pickup_spot && item.pickup_spot.toLowerCase().includes(selectedSpot.toLowerCase()));

    return matchesSearch && matchesCat && matchesType && matchesSpot;
  });

  const activeEvent = campusPulseEvents[activePulseIndex];

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Live Campus Pulse Ticker */}
      <div className="campus-pulse-bar">
        <div style={{ 
          maxWidth: '1240px', 
          margin: '0 auto', 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'nowrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
            <span style={{ 
              background: 'var(--accent-gradient)', 
              color: '#ffffff', 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              padding: '0.18rem 0.55rem', 
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              flexShrink: 0
            }}>
              {activeEvent.tag}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: 500 }}>
              {activeEvent.text}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            <span>⚡ 12 min avg handover</span>
            <span>🌱 {campusStats.co2SavedKg}kg CO₂ saved</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', width: '100%', flex: 1 }}>
        
        {/* Hero Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '2.5rem', 
          marginBottom: '2.75rem',
          paddingBottom: '2.25rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ maxWidth: '690px' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              padding: '0.3rem 0.85rem', 
              borderRadius: '999px', 
              background: 'var(--accent-primary-subtle)', 
              border: '1px solid var(--accent-primary-border)', 
              color: 'var(--accent-primary)', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              marginBottom: '1rem' 
            }}>
              <IconSparkles size={14} color="var(--accent-primary)" />
              <span>Jahangirnagar University Student Collective</span>
            </div>
            
            <h1 style={{ 
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.1rem, 1.8rem + 1.6vw, 3rem)', 
              fontWeight: '700', 
              letterSpacing: '-0.025em', 
              color: 'var(--text-main)',
              lineHeight: 1.22
            }}>
              Exchange, Borrow & Trade Essentials with Trusted Peers.
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '0.85rem', lineHeight: 1.65 }}>
              Don't buy expensive gear you only need for one semester. Borrow calculators, lab coats, and engineering drafters, or pass forward textbooks and lecture notes to junior hall mates.
            </p>
          </div>

          {/* Quick Metrics Pillar */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.9rem', 
            minWidth: '290px' 
          }}>
            <div className="bento-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                {resources.length || 12}+
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                Active Listings
              </div>
            </div>
            <div className="bento-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                538
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                Lent on Campus
              </div>
            </div>
            <div className="bento-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
                99.4%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                On-Time Returns
              </div>
            </div>
            <div className="bento-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: '800', color: 'var(--accent-plum)' }}>
                680 kg
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 600 }}>
                CO₂ Prevented
              </div>
            </div>
          </div>
        </div>

        {/* Search, Spot & Category Control Bar */}
        <div style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: '18px', 
          padding: '1.4rem', 
          marginBottom: '2.25rem',
          boxShadow: 'var(--shadow-card)' 
        }}>
          
          {/* Search Row + Listing Type Switcher */}
          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.15rem' }}>
            <div style={{ position: 'relative', flex: '1 1 320px' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <IconSearch size={16} color="var(--text-muted)" />
              </div>
              <input 
                type="text"
                placeholder="Search calculators, books, lab coats, or hall spots (e.g. TSC, Al-Beruni)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.85rem', paddingRight: searchQuery ? '2.5rem' : '1rem' }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="btn-ghost"
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.25rem' }}
                >
                  <IconX size={15} />
                </button>
              )}
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ 
              display: 'flex', 
              gap: '0.3rem', 
              background: 'var(--bg-surface-subtle)', 
              padding: '0.35rem', 
              borderRadius: '11px',
              border: '1px solid var(--border-subtle)'
            }}>
              {[
                { id: 'all', label: 'All Items' },
                { id: 'sell', label: 'For Sale' },
                { id: 'lend', label: 'To Borrow' },
                { id: 'free', label: 'Free Giveaways' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedListingType(type.id)}
                  style={{
                    background: selectedListingType === type.id ? 'var(--accent-gradient)' : 'transparent',
                    color: selectedListingType === type.id ? '#ffffff' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.48rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Hotspots Filter Bar */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.55rem', 
            overflowX: 'auto', 
            paddingBottom: '0.75rem',
            marginBottom: '0.85rem',
            borderBottom: '1px solid var(--border-subtle)' 
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
              <IconMapPin size={13} color="var(--accent-primary)" /> Meetup Spot:
            </span>
            {campusHotspots.map(spot => {
              const isSelected = selectedSpot === spot;
              return (
                <button
                  key={spot}
                  onClick={() => setSelectedSpot(spot)}
                  style={{
                    background: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '7px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {spot}
                </button>
              );
            })}
          </div>

          {/* Category Visual Rail */}
          <div style={{ display: 'flex', gap: '0.55rem', overflowX: 'auto', paddingTop: '0.25rem', alignItems: 'center' }}>
            {campusCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                    padding: '0.42rem 1rem',
                    borderRadius: '9px',
                    fontSize: '0.84rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

        </div>

        {/* Real Bento Marketplace Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
            <div className="pulse-dot" style={{ width: '12px', height: '12px', marginBottom: '1rem' }} />
            <p>Syncing verified campus resources...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="bento-grid">
            {filteredItems.map(item => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        ) : (
          <div className="bento-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              No campus listings matched your filter
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '1.5rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
              Try searching a broader term, or clear the active hotspot filter.
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedListingType('all'); setSelectedSpot('All Spots'); }} 
              className="btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Safety & Meetup Guide Banner */}
        <div style={{ 
          marginTop: '4.5rem', 
          padding: '2rem', 
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '18px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.75rem'
        }}>
          <div style={{ maxWidth: '680px' }}>
            <h4 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <IconShieldCheck size={19} color="var(--accent-emerald)" />
              <span>Safe Campus Handover Protocol</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Always meet during daylight hours at designated landmark locations: <strong>TSC Cafeteria, Bottola Tea Stalls, Central Library Lawn, or Residence Hall Front Desks</strong>. Inspect item condition together before completing payment or handover.
            </p>
          </div>

          <Link to="/create-resource" className="btn-primary" style={{ padding: '0.72rem 1.45rem' }}>
            <IconPlus size={16} />
            <span>List Your Resource</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;