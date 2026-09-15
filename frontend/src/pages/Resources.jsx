import { useState } from 'react';
import Navbar from '../components/Navbar';
import ResourceCard from '../components/ResourceCard';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dummy data
  const resources = [
    { id: 1, type: 'offer', title: '20 Meal Boxes', description: 'Freshly packed meal boxes.', category: 'food', quantity: 20, location: 'Dhanmondi', urgency: 'low' },
    { id: 2, type: 'request', title: 'Winter Blankets Needed', description: 'Clean, heavy blankets.', category: 'clothing', quantity: 15, location: 'Mirpur', urgency: 'high' }
  ];

  const controlStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', outline: 'none'
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Browse Resources</h2>
        
        {/* Search & Filter Bar */}
        <div className="bento-card" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <input 
            style={{ ...controlStyle, flex: '1', minWidth: '200px' }} 
            type="text" 
            placeholder="Search resources..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select style={controlStyle}>
            <option value="">All Categories</option>
            <option value="food">Food</option>
            <option value="clothing">Clothing</option>
            <option value="medicine">Medicine</option>
          </select>
          <select style={controlStyle}>
            <option value="">All Locations</option>
            <option value="Dhanmondi">Dhanmondi</option>
            <option value="Mirpur">Mirpur</option>
          </select>
          <select style={controlStyle}>
            <option value="">Any Urgency</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="bento-grid" style={{ padding: 0 }}>
          {resources.map(res => <ResourceCard key={res.id} resource={res} />)}
        </div>
      </div>
    </>
  );
};

export default Resources;