import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const CreateResources = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fixedType = searchParams.get('type') || 'sell'; 

  const [formData, setFormData] = useState({
    listing_type: fixedType,
    category: '',
    title: '',
    location: '',
    quantity: 1,
    price: '', 
    description: '',
    urgency: 'low' // Added default urgency to state!
  });

  useEffect(() => {
    setFormData(prev => ({ ...prev, listing_type: fixedType }));
  }, [fixedType]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const uiConfig = {
    sell: { title: 'List an Item for Sale', subtitle: 'Share details about the item you want to sell to the community.', priceLabel: 'Price (BDT) *' },
    buy: { title: 'Request to Buy', subtitle: 'Tell the community what you are looking to purchase.', priceLabel: 'Budget (Max BDT)' },
    lend: { title: 'Offer an Item to Lend', subtitle: 'Help out by lending your items to fellow students.', priceLabel: 'Rental Fee / Deposit (Optional)' },
    borrow: { title: 'Request to Borrow', subtitle: 'Need something temporarily? See if the community has it.', priceLabel: 'Budget / Willing to Pay (Optional)' },
    free: { title: 'Give Away an Item', subtitle: 'List an item you want to give away for free to someone in need.', priceLabel: null },
  };

  const currentUI = uiConfig[fixedType];
  const isRequest = fixedType === 'buy' || fixedType === 'borrow';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // The payload now grabs the dynamic urgency from your form!
    // Calculate if it's an offer or request based on the form type
    const dbType = isRequest ? 'request' : 'offer';

    const payload = {
      listing_type: formData.listing_type,   // Goes to varchar(50) -> 'sell', 'buy', etc.
      type: dbType,                          // Goes to enum -> 'offer' or 'request'
      title: formData.title,
      category: formData.category,
      location: formData.location,
      description: formData.description,
      quantity: Number(formData.quantity),   
      price: formData.price === '' ? null : Number(formData.price), // Sends null if empty
      urgency: formData.urgency,                        
      status: 'available'                    
    };

    try {
      const response = await api.post('/resources', payload);
      if (response.data.success) {
        setSuccess('Post published successfully!');
        setTimeout(() => navigate(`/${fixedType}`), 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create post. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{currentUI.title}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {currentUI.subtitle}
      </p>

      {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* NEW FLEX ROW: Category & Urgency side-by-side */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
              <option value="" style={{ background: '#1f2937' }}>Select a Category</option>
              <option value="education materials" style={{ background: '#1f2937' }}>Education & Books</option>
              <option value="clothing" style={{ background: '#1f2937' }}>Clothing</option>
              <option value="food" style={{ background: '#1f2937' }}>Food</option>
              <option value="tools" style={{ background: '#1f2937' }}>Tools & Tech</option>
              <option value="furniture" style={{ background: '#1f2937' }}>Furniture</option>
              <option value="outdoor" style={{ background: '#1f2937' }}>Outdoor</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '150px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Urgency *</label>
            <select name="urgency" value={formData.urgency} onChange={handleChange} required style={inputStyle}>
              <option value="low" style={{ background: '#1f2937' }}>Low (Flexible)</option>
              <option value="medium" style={{ background: '#1f2937' }}>Medium (Soon)</option>
              <option value="high" style={{ background: '#1f2937' }}>High (Immediate)</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder={isRequest ? "What do you need?" : "What are you offering?"} style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Campus Location *</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g., TSC" style={inputStyle} />
          </div>

          <div style={{ flex: 1, minWidth: '100px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Quantity *</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required style={inputStyle} />
          </div>

          {currentUI.priceLabel && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
                {currentUI.priceLabel}
              </label>
              <input 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required={fixedType === 'sell'} 
                placeholder={isRequest ? 'Leave blank for any' : 'e.g., 400'} 
                style={inputStyle} 
              />
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Description & Details</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Add more details about the item or your specific requirements..." style={{ ...inputStyle, resize: 'vertical' }}></textarea>
        </div>

        <button type="submit" style={{
          backgroundColor: 'var(--accent-red)', color: 'white', padding: '1rem',
          borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem',
          cursor: 'pointer', marginTop: '1rem'
        }}>
          Publish Post
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '0.75rem', borderRadius: '8px', 
  border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', 
  color: 'var(--text-main)', boxSizing: 'border-box'
};

export default CreateResources;