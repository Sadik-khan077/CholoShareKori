import { useState } from 'react';
import ResourceCard from '../components/ResourceCard';

const Free = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Mock data: Free items offered by others
  const freeItems = [
    { id: 7, type: 'Free', title: 'High School Textbooks', description: 'Grade 9 and 10 science and math textbooks in good condition.', category: 'education materials', quantity: 5, location: 'Gulshan', urgency: 'low', status: 'available' },
    { id: 8, type: 'Free', title: 'Baby Clothes (0-6 months)', description: 'A bag of gently used baby clothes.', category: 'clothing', quantity: 10, location: 'Dhanmondi', urgency: 'low', status: 'available' }
  ];

  const filteredResources = freeItems.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || resource.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const controlStyle = { padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)' };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Free Commodities</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Discover items being given away for free by the community.</p>
      
      <div className="bento-card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          style={{ ...controlStyle, flex: '1', minWidth: '200px' }} 
          type="text" 
          placeholder="Search free items..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select style={controlStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="clothing">Clothing</option>
          <option value="education materials">Education Materials</option>
          <option value="food">Food</option>
        </select>
      </div>
      
      <div className="bento-grid" style={{ padding: 0 }}>
        {filteredResources.length > 0 ? (
          filteredResources.map(resource => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No free items found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default Free;