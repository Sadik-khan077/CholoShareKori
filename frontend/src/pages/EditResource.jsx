import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Initialize with empty/default values
  const [formData, setFormData] = useState({
    title: '', category: '', quantity: 1, price: '', location: '', description: ''
  });

  // Mock fetching the existing data (TODO: Replace with actual API call)
  useEffect(() => {
    // api.get(`/resources/${id}`).then(res => setFormData(res.data))
    console.log(`Fetching data for resource ${id}...`);
    setFormData({
      title: 'Power Drill Set', // Mock data
      category: 'other',
      quantity: 1,
      price: '',
      location: 'Dhanmondi',
      description: 'Complete power drill set with multiple bits. Available to lend for up to 3 days....'
    });
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updating resource:', formData);
    // TODO: Connect to api.put(`/resources/${id}`, formData)
    
    // Send user back to their profile or the previous page after saving
    navigate(-1);
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', width: '100%', outline: 'none'
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: 0, fontSize: '1rem', marginBottom: '1.5rem' }}>
        ← Back
      </button>
      
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Edit Post</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Update the details of your listing.</p>

      <form className="bento-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Title *</label>
          <input style={inputStyle} type="text" required
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        {/* Location & Quantity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Location *</label>
            <input style={inputStyle} type="text" required
              value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quantity *</label>
            <input style={inputStyle} type="number" min="1" required
              value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <button type="submit" style={{
          backgroundColor: 'var(--accent-red)', color: '#fff', padding: '1rem',
          borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '1rem', fontSize: '1rem'
        }}>
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditResource;