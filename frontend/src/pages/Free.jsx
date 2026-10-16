import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { 
  IconSearch, 
  IconGift, 
  IconPlus, 
  IconX,
  IconSparkles
} from '../components/Icons';
import { getStoredCampusListings } from '../services/campusData';

const Free = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await api.get('/resources');
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const filtered = response.data.data.filter(item => item.listing_type === 'free' || Number(item.price) === 0);
        setItems(filtered);
      } else {
        const local = getStoredCampusListings().filter(item => item.listing_type === 'free' || Number(item.price) === 0);
        setItems(local);
      }
    } catch (error) {
      const local = getStoredCampusListings().filter(item => item.listing_type === 'free' || Number(item.price) === 0);
      setItems(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = [
    { id: '', label: 'All Free Giveaways' },
    { id: 'education materials', label: 'Course Notes & Exam Guides' },
    { id: 'tools', label: 'Calculators & Mini Tools' },
    { id: 'furniture', label: 'Hall Mats & Essentials' },
    { id: 'clothing', label: 'Fresher Wear & Winter Wear' }
  ];

  let processed = items.filter(item => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q));

    const matchesCat = !categoryFilter || item.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', width: '100%' }}>
      
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1.75rem', 
        marginBottom: '2.25rem' 
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
            <IconGift size={14} color="var(--accent-emerald)" />
            <span>Campus Altruism & Giveaways</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Free Giveaways & Care Pool
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
            Generous donations from graduating seniors and peers. 100% free for students in need.
          </p>
        </div>

        <Link to="/create-resource?type=free" className="btn-primary" style={{ background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #166534 100%)' }}>
          <IconPlus size={16} />
          <span>Donate an Item for Free</span>
        </Link>
      </div>

      {/* Altruism Highlight Card */}
      <div style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '16px', 
        padding: '1.25rem 1.75rem', 
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IconSparkles size={16} color="var(--accent-emerald)" />
            <span>Campus Fresher Support Initiative</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '640px', lineHeight: 1.55 }}>
            Have extra blankets, lecture notes, or unused lab equipment? Pass them on to juniors. Senior students have gifted over 180 essentials this academic session.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '0 0.75rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>184</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Gifts Handed Over</div>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
          <div style={{ textAlign: 'center', padding: '0 0.75rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-amber)' }}>৳320k</div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saved by Juniors</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '18px', 
        padding: '1.4rem', 
        marginBottom: '2.25rem',
        boxShadow: 'var(--shadow-card)' 
      }}>
        <div style={{ position: 'relative', marginBottom: '1.15rem' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <IconSearch size={16} color="var(--text-muted)" />
          </div>
          <input 
            type="text"
            placeholder="Search free textbooks, lecture notes, winter blankets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.8rem' }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="btn-ghost" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.2rem' }}>
              <IconX size={15} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '0.55rem', overflowX: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          {categories.map(cat => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  background: isSelected ? 'var(--accent-emerald-subtle)' : 'var(--bg-surface-subtle)',
                  color: isSelected ? 'var(--accent-emerald-text)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease'
                }}
              >
                {cat.label}
              </button>
            );
          })}
          <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {processed.length} gifts available
          </span>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading free community gifts...
        </div>
      ) : processed.length > 0 ? (
        <div className="bento-grid">
          {processed.map(item => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      ) : (
        <div className="bento-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎁</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No free giveaways right now</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Have items you no longer use? Donate them to junior students and build your campus karma.
          </p>
          <Link to="/create-resource?type=free" className="btn-primary">
            Donate First Item
          </Link>
        </div>
      )}

    </div>
  );
};

export default Free;