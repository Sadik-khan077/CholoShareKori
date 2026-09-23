import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State declarations
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/resources/${id}`);
        const item = response.data.data; 
        
        setTitle(item.title);
        setLocation(item.location);
        setQuantity(item.quantity);
        setDescription(item.description);
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      }
    };
    
    if (id) fetchResource();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const updatedData = { title, location, quantity, description };
    
    try {
      // Sends the updated data to the backend
      await api.put(`/resources/${id}`, updatedData);
      
      // Sends you back to the previous page upon success
      navigate(-1);
    } catch (error) {
      console.error("Failed to update resource", error);
      alert("Failed to save changes. Please try again.");
    }
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
            value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        {/* Location & Quantity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Location *</label>
            <input style={inputStyle} type="text" required
              value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quantity *</label>
            <input style={inputStyle} type="number" min="1" required
              value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
            value={description} onChange={e => setDescription(e.target.value)} />
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