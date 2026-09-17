import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Buy = () => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [availableItems, setAvailableItems] = useState([]);

  useEffect(() => {
    const fetchMarketItems = async () => {
      try {
        const response = await api.get('/resources');
        const filtered = response.data.data.filter(
          item => item.listing_type === 'sell' && Number(item.user_id) !== Number(user?.id)
        );
        setAvailableItems(filtered);
      } catch (error) {
        console.error("Error fetching buy items:", error);
      }
    };
    fetchMarketItems();
  }, [user]);

  let processedResources = availableItems.filter(resource => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (resource.title && resource.title.toLowerCase().includes(searchLower)) ||
      (resource.description && resource.description.toLowerCase().includes(searchLower)) ||
      (resource.location && resource.location.toLowerCase().includes(searchLower)) ||
      (resource.category && resource.category.toLowerCase().includes(searchLower));
      
    const matchesCategory = categoryFilter === '' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };

  processedResources.sort((a, b) => {
    const weightA = urgencyWeight[a.urgency?.toLowerCase()] || 1; 
    const weightB = urgencyWeight[b.urgency?.toLowerCase()] || 1;
    
    if (weightA !== weightB) {
      return weightB - weightA; 
    }

    if (sortBy === 'price-asc') return Number(a.price) - Number(b.price);
    if (sortBy === 'price-desc') return Number(b.price) - Number(a.price);
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const controlStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' };
  const optionStyle = { background: '#1f2937' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Marketplace: Buy</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Browse items available for purchase in your community.</p>
      
      <div className="bento-card" style={{ 
        display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap',
        position: 'sticky', top: '75px', zIndex: 999, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
      }}>
        <input 
          style={{ ...controlStyle, flex: '2', minWidth: '250px' }} 
          type="text" 
          placeholder="Search by title, location, category, or description..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select style={{...controlStyle, flex: '1', minWidth: '150px'}} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="" style={optionStyle}>All Categories</option>
          <option value="education materials" style={optionStyle}>Education Materials</option>
          <option value="clothing" style={optionStyle}>Clothing</option>
          <option value="food" style={optionStyle}>Food</option>
          <option value="tools" style={optionStyle}>Tools & Tech</option>
          <option value="furniture" style={optionStyle}>Furniture</option>
          <option value="outdoor" style={optionStyle}>Outdoor</option>
        </select>

        <select style={{...controlStyle, flex: '1', minWidth: '180px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest" style={optionStyle}>Sort: Newest First</option>
          <option value="price-asc" style={optionStyle}>Price: Low to High</option>
          <option value="price-desc" style={optionStyle}>Price: High to Low</option>
        </select>
      </div>
      
      <div className="bento-grid" style={{ padding: 0 }}>
        {processedResources.length > 0 ? (
          processedResources.map(resource => (
            <div key={resource.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ResourceCard resource={resource} />
              
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ 
                  color: resource.urgency === 'high' ? '#ef4444' : resource.urgency === 'medium' ? '#f59e0b' : 'var(--text-muted)',
                  fontWeight: 'bold', textTransform: 'capitalize'
                }}>
                  {resource.urgency} Urgency
                </span>
                <span>
                  Posted by: <Link to={`/profile/${resource.user_id}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 'bold' }}>{resource.user_name || 'User'}</Link>
                </span>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No items found matching your search criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Buy;