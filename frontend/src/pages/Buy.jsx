import { useState } from 'react';
import ResourceCard from '../components/ResourceCard';

const Buy = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Mock data: Items other people are selling
  const availableItems = [
    { id: 2, type: 'Sell', title: '20 Meal Boxes', description: 'Freshly packed meal boxes available for pickup.', category: 'food', quantity: 20, location: 'Dhanmondi', urgency: 'low', status: 'available' },
    { id: 3, type: 'Sell', title: 'Winter Jacket', description: 'Slightly used heavy winter jacket.', category: 'clothing', quantity: 1, location: 'Mirpur', urgency: 'low', status: 'available' }
  ];

  const filteredResources = availableItems.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const controlStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Marketplace: Buy</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Browse items available for purchase in your community.</p>
      
      {/* Search & Filter Bar */}
      <div className="bento-card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          style={{ ...controlStyle, flex: '1', minWidth: '200px' }} 
          type="text" 
          placeholder="Search items to buy..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select style={controlStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="food">Food</option>
          <option value="clothing">Clothing</option>
          <option value="education materials">Education Materials</option>
        </select>
      </div>
      
      {/* Resource Grid */}
      <div className="bento-grid" style={{ padding: 0 }}>
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No items found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Buy;