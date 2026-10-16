import { useState, useEffect, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  IconSearch, 
  IconHandshake, 
  IconPlus, 
  IconX,
  IconShieldCheck,
  IconClock
} from '../components/Icons';
import { getStoredCampusListings } from '../services/campusData';

const Borrow = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [onlyFree, setOnlyFree] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await api.get('/resources');
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const filtered = response.data.data.filter(item => item.listing_type === 'lend');
        setAvailableItems(filtered);
      } else {
        const local = getStoredCampusListings().filter(item => item.listing_type === 'lend');
        setAvailableItems(local);
      }
    } catch (error) {
      const local = getStoredCampusListings().filter(item => item.listing_type === 'lend');
      setAvailableItems(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = [
    { id: '', label: 'All Equipment' },
    { id: 'tools', label: 'Tech, Drafters & Multimeters' },
    { id: 'clothing', label: 'Lab Coats & Practical Wear' },
    { id: 'education materials', label: 'Molecular Kits & Reference Books' }
  ];

  let processed = availableItems.filter(item => {
    if (user && Number(item.user_id) === Number(user.id)) return false;

    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q));

    const matchesCat = !categoryFilter || item.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesFree = !onlyFree || Number(item.price) === 0;

    return matchesSearch && matchesCat && matchesFree;
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-plum)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
            <IconHandshake size={14} color="var(--accent-plum)" />
            <span>Short-Term Peer Lending Pool</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Lend & Borrow Equipment
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
            Borrow lab coats, mini drafters, and test instruments for exams without buying brand new.
          </p>
        </div>

        <Link to="/create-resource?type=lend" className="btn-primary">
          <IconPlus size={16} />
          <span>Offer an Item to Lend</span>
        </Link>
      </div>

      {/* Trust Guarantee Banner */}
      <div style={{ 
        background: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '16px', 
        padding: '1rem 1.5rem', 
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        fontSize: '0.88rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
          <IconShieldCheck size={20} color="var(--accent-emerald)" />
          <span>
            <strong>Zero-Collateral Campus Trust:</strong> Every borrower commits to 100% on-time return with transparent 24h grace period.
          </span>
        </div>
        <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <IconClock size={15} />
          <span>Average return rate: 99.4%</span>
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
        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.15rem' }}>
          
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <IconSearch size={16} color="var(--text-muted)" />
            </div>
            <input 
              type="text"
              placeholder="Search lab coats, mini drafters, multimeters, or hall gates..."
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

          <button
            onClick={() => setOnlyFree(!onlyFree)}
            style={{
              background: onlyFree ? 'var(--accent-emerald-subtle)' : 'var(--bg-surface-subtle)',
              color: onlyFree ? 'var(--accent-emerald-text)' : 'var(--text-secondary)',
              border: onlyFree ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)',
              padding: '0.65rem 1.15rem',
              borderRadius: '9px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{onlyFree ? '✓ 100% Free Loans Only' : 'Show Free Loans Only'}</span>
          </button>

        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.55rem', overflowX: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', alignItems: 'center' }}>
          {categories.map(cat => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                style={{
                  background: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                  color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  border: isSelected ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                  padding: '0.4rem 0.95rem',
                  borderRadius: '9px',
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
            {processed.length} equipment items borrowable
          </span>
        </div>

      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading borrowable equipment...
        </div>
      ) : processed.length > 0 ? (
        <div className="bento-grid">
          {processed.map(item => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      ) : (
        <div className="bento-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No borrowable items matched</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Try clearing the search term, or list an item to help your peers during exam season.
          </p>
          <button onClick={() => { setSearchTerm(''); setCategoryFilter(''); setOnlyFree(false); }} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default Borrow;