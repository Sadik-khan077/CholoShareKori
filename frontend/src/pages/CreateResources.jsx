import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateResources = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    listing_type: 'sell', title: '', category: '', quantity: 1,
    price: '', location: '', description: '', urgency: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clean up the payload before sending
    const payload = {
      ...formData,
      // The backend requires "type" to be 'offer' or 'request'
      type: ['sell', 'lend', 'free'].includes(formData.listing_type) ? 'offer' : 'request',
      // Ensure price is null if it's not a sell/buy listing to avoid DB errors
      price: (formData.listing_type === 'sell' || formData.listing_type === 'buy') ? parseFloat(formData.price) : null
    };

    try {
      await api.post('/resources', payload);
      alert('Resource posted successfully!');
      // Send user back to the respective pillar page after posting
      navigate(`/${formData.listing_type}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to post resource.';
      alert(errorMsg);
      console.error('Resource Creation Error:', error.response?.data || error.message);
    }
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', width: '100%', outline: 'none'
  };

  const campusLocations = [
    "Al-Beruni Hall", "Mir Mosharraf Hossain Hall", "Central Cafeteria",
    "TSC (Teacher-Student Centre)", "Central Library", "Science Faculty", "Arts Faculty"
  ]; // Add the rest of your JU locations here

  const categories = [
    { name: "Food & Groceries", slug: "food" },
    { name: "Clothing", slug: "clothing" },
    { name: "Medicine & Health", slug: "medicine" },
    { name: "Education & Books", slug: "education" },
    { name: "Electronics", slug: "electronics" },
    { name: "Other", slug: "other" }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create a Post</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Fill out the details below to share or request an item.</p>

      <form className="bento-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Listing Type & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Post Type *</label>
            <select style={inputStyle} value={formData.listing_type} onChange={e => setFormData({ ...formData, listing_type: e.target.value })}>
              <option value="sell">I want to Sell something</option>
              <option value="buy">I want to Buy something</option>
              <option value="lend">I want to Lend something out</option>
              <option value="borrow">I need to Borrow something</option>
              <option value="free">I am giving this away for Free</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Category *</label>
            <select style={inputStyle} required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="" disabled>Select a Category</option>
              {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Title *</label>
          <input style={inputStyle} type="text" placeholder="e.g., 20 Meal Boxes, Used Engineering Textbooks" required
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </div>

        {/* Location, Quantity, Price */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Campus Location *</label>
            <select style={inputStyle} required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}>
              <option value="" disabled>Select Location</option>
              {campusLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quantity *</label>
            <input style={inputStyle} type="number" min="1" required
              value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })} />
          </div>

          {/* Dynamic Price Field - Only shows if selling or buying */}
          {(formData.listing_type === 'sell' || formData.listing_type === 'buy') && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {formData.listing_type === 'sell' ? 'Price (BDT) *' : 'Budget (BDT) *'}
              </label>
              <input style={inputStyle} type="number" min="1" required placeholder="0.00"
                value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Description & Details</label>
          <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} placeholder="Provide more details about the item..."
            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        <button type="submit" style={{
          backgroundColor: 'var(--accent-red)', color: '#fff', padding: '1rem',
          borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', fontSize: '1rem'
        }}>
          Post Resource
        </button>
      </form>
    </div>
  );
};

export default CreateResources;