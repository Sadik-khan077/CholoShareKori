import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(1);
  
  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/resources/${id}`);
        const item = response.data.data; 
        
        setTitle(item.title);
        setLocation(item.location);
        setQuantity(item.quantity);
        setDescription(item.description);
        setPrice(item.price);
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      }
    };
    
    if (id) fetchResource();
  }, [id]);

  // Triggers the modal instead of submitting immediately
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true); 
  };

  // The actual function that fires when "Confirm" is clicked
  const confirmUpdate = async () => {
    const updatedData = { title, location, quantity, description, price };
    
    try {
      await api.put(`/resources/${id}`, updatedData);
      navigate(-1);
    } catch (error) {
      console.error("Failed to update resource", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setShowConfirmModal(false);
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
        
        {/* Title & Price*/}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Title *</label>
            <input style={inputStyle} type="text" required
              value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Price *</label>
            <input style={inputStyle} type="number" step="0.01" min="0" required
              value={price} onChange={e => setPrice(Number(e.target.value))} />
          </div>
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

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Confirm Update</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you sure you want to save these changes?</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpdate} 
                style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: 'var(--accent-red)', color: 'white', flex: 1 }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditResource;