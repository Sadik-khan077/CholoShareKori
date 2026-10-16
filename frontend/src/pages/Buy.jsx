import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { 
  IconSearch, 
  IconShoppingBag, 
  IconPlus, 
  IconX 
} from '../components/Icons';
import { getStoredCampusListings } from '../services/campusData';

const Buy = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest | price_asc | price_desc | urgent
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await api.get('/resources');
      if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const filtered = response.data.data.filter(item => item.listing_type === 'sell');
        setItems(filtered);
      } else {
        const local = getStoredCampusListings().filter(item => item.listing_type === 'sell');
        setItems(local);
      }
    } catch (error) {
      const local = getStoredCampusListings().filter(item => item.listing_type === 'sell');
      setItems(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const categories = [
    { id: '', label: 'All Items' },
    { id: 'education materials', label: 'Books & Textbooks' },
    { id: 'tools', label: 'Calculators & Tech' },
    { id: 'furniture', label: 'Hall Chairs & Tables' },
    { id: 'outdoor', label: 'Cycles & Sports' }
  ];

  let processed = items.filter(item => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q));

    const matchesCat = !categoryFilter || item.category?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesPrice = !maxPrice || Number(item.price) <= Number(maxPrice);

    return matchesSearch && matchesCat && matchesPrice;
  });

  // Sorting
  processed.sort((a, b) => {
    if (sortBy === 'price_asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price_desc') return Number(b.price) - Number(a.price);
    if (sortBy === 'urgent') {
      const w = { critical: 3, high: 2, medium: 1, low: 0 };
      return (w[b.urgency] || 1) - (w[a.urgency] || 1);
    }
    return new Date(b.created_at) - new Date(a.created_at);
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
            <IconShoppingBag size={14} color="var(--accent-primary)" />
            <span>Campus Second-Hand Exchange</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Student Marketplace
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
            Affordable textbooks, scientific tools, and dorm gear sold directly between students.
          </p>
        </div>

        <Link to="/create-resource?type=sell" className="btn-primary">
          <IconPlus size={16} />
          <span>Sell an Item</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '18px', 
        padding: '1.4rem', 
        marginBottom: '2.25rem',
        boxShadow: 'var(--shadow-card)' 
      }}>
        <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.15rem' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <IconSearch size={16} color="var(--text-muted)" />
            </div>
            <input 
              type="text"
              placeholder="Search by title, location (e.g. Al-Beruni), or subject..."
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

          {/* Quick Price Cap Selector */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {[
              { label: 'All Prices', val: '' },
              { label: '< ৳500', val: '500' },
              { label: '< ৳1000', val: '1000' }
            ].map(pill => {
              const isSelected = maxPrice === pill.val;
              return (
                <button
                  key={pill.val}
                  onClick={() => setMaxPrice(pill.val)}
                  style={{
                    background: isSelected ? 'var(--accent-primary-subtle)' : 'var(--bg-surface-subtle)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div style={{ minWidth: '170px' }}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="form-select"
              style={{ padding: '0.55rem 0.95rem', fontSize: '0.86rem' }}
            >
              <option value="newest">Sort: Newly Listed</option>
              <option value="price_asc">Price: Lowest First</option>
              <option value="price_desc">Price: Highest First</option>
              <option value="urgent">Urgency: Critical First</option>
            </select>
          </div>

        </div>

        {/* Categories Pills */}
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
            {processed.length} items available
          </span>
        </div>

      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading student listings...
        </div>
      ) : processed.length > 0 ? (
        <div className="bento-grid">
          {processed.map(item => (
            <ResourceCard key={item.id} resource={item} />
          ))}
        </div>
      ) : (
        <div className="bento-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛍️</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No items matched your filter</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            Try resetting your price cap or search term.
          </p>
          <button onClick={() => { setSearchTerm(''); setCategoryFilter(''); setMaxPrice(''); }} className="btn-secondary">
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default Buy;