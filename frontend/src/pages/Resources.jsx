import { useState, useEffect } from 'react';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { IconSearch } from '../components/Icons';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await api.get('/resources');
        setResources(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filtered = resources.filter(res => {
    const matchesSearch = (res.title && res.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (res.location && res.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === '' || res.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ padding: '2.5rem 1.5rem', maxWidth: '1260px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ 
          display: 'inline-block', 
          fontFamily: 'var(--font-bengali)', 
          fontSize: '0.95rem', 
          color: 'var(--accent-primary)', 
          fontWeight: 700, 
          marginBottom: '0.4rem' 
        }}>
          ক্যাম্পাস উন্মুক্ত ভাণ্ডার • Campus Directory
        </span>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: '2.3rem', 
          fontWeight: 800, 
          letterSpacing: '-0.02em', 
          color: 'var(--text-main)', 
          lineHeight: 1.2 
        }}>
          Browse All Campus Resources
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem', maxWidth: '680px' }}>
          Explore peer-shared textbooks, lab equipment, tools, cycle shares, and dorm essentials across all campus pillars.
        </p>
      </div>
      
      {/* Search & Filter Bar */}
      <div className="bento-card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '2', minWidth: '240px' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <IconSearch size={18} />
          </div>
          <input 
            className="form-input" 
            style={{ paddingLeft: '2.75rem', width: '100%' }} 
            type="text" 
            placeholder="Search items, titles, or campus locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="form-select" 
          style={{ flex: '1', minWidth: '180px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>All Categories</option>
          <option value="education materials" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>📚 Books & Education</option>
          <option value="tools" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>🛠️ Tools & Tech</option>
          <option value="clothing" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>👕 Clothing</option>
          <option value="food" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>🍲 Food & Groceries</option>
          <option value="furniture" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>🪑 Furniture & Dorm</option>
          <option value="outdoor" style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>🚲 Cycle & Outdoor</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px', margin: '0 auto 1rem' }} />
          Loading resources...
        </div>
      ) : filtered.length > 0 ? (
        <div className="bento-grid">
          {filtered.map(res => <ResourceCard key={res.id} resource={res} />)}
        </div>
      ) : (
        <div className="bento-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>No resources found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;