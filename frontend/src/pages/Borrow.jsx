import { useState } from 'react';
import ResourceCard from '../components/ResourceCard';

const Borrow = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Mock data: Items other people are offering to lend
  const availableToBorrow = [
    { id: 5, type: 'Lend', title: 'Folding Tables', description: 'Two large folding tables, great for events.', category: 'furniture', quantity: 2, location: 'Mirpur', urgency: 'low', status: 'available' },
    { id: 6, type: 'Lend', title: 'Camping Tent', description: '4-person camping tent.', category: 'outdoor', quantity: 1, location: 'Gulshan', urgency: 'low', status: 'available' }
  ];

  const filteredResources = availableToBorrow.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const controlStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Marketplace: Borrow</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Browse items you can borrow temporarily from your neighbors.</p>
      
      {/* Search & Filter Bar */}
      <div className="bento-card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          style={{ ...controlStyle, flex: '1', minWidth: '200px' }} 
          type="text" 
          placeholder="Search items to borrow..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select style={controlStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="tools">Tools</option>
          <option value="furniture">Furniture</option>
          <option value="outdoor">Outdoor</option>
        </select>
      </div>
      
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

export default Borrow;