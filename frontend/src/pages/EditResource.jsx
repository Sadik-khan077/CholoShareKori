import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const campusLocations = [
  "TSC (Teacher-Student Centre)", 
  "Central Library", 
  "Al-Beruni Hall", 
  "Mir Mosharraf Hossain Hall", 
  "Shaheed Salahuddin Hall",
  "Maulana Bhasani Hall", 
  "Bangabandhu Sheikh Mujibur Rahman Hall", 
  "Syed Nazrul Islam Hall",
  "Shaheed Rafiq-Jabbar Hall", 
  "A. F. M. Kamaluddin Hall", 
  "Bishwabidyalay Hall",
  "Jahanara Imam Hall", 
  "Pritilata Hall", 
  "Noorjahan Hall", 
  "Sufia Kamal Hall",
  "Fatema Mernissi Hall", 
  "Bangamata Sheikh Fazilatunnesa Mujib Hall", 
  "Central Cafeteria",
  "Science Faculty", 
  "Arts Faculty",
  "Social Science Faculty", 
  "Main Gate Area", 
  "Medical Centre", 
  "Other Campus Area"
];

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const response = await api.get(`/resources/${id}`);
        const item = response.data.data; 
        
        setTitle(item.title || '');
        setLocation(item.location || '');
        setQuantity(item.quantity || 1);
        setDescription(item.description || '');
        setPrice(item.price || 0);
      } catch (error) {
        console.error("Failed to fetch resource:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchResource();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true); 
  };

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Loading post details...
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      <button 
        onClick={() => navigate(-1)} 
        className="btn-ghost" 
        style={{ marginBottom: '1.25rem', paddingLeft: 0, color: 'var(--text-muted)' }}
      >
        ← Back
      </button>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Edit Resource Post
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
          Update item details, location, quantity, or pricing.
        </p>
      </div>

      <form className="bento-card" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.65rem' }}>
        
        {/* Title & Price */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              Resource Title *
            </label>
            <input 
              className="form-input" 
              type="text" 
              required
              value={title} 
              onChange={e => setTitle(e.target.value)} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              Price / Fee (BDT) *
            </label>
            <input 
              className="form-input" 
              type="number" 
              step="0.01" 
              min="0" 
              required
              value={price} 
              onChange={e => setPrice(Number(e.target.value))} 
            />
          </div>
        </div>

        {/* Location & Quantity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              Campus Location *
            </label>
            <select 
              className="form-select"
              required
              value={location} 
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">Select Campus Location</option>
              {campusLocations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
              Quantity Available *
            </label>
            <input 
              className="form-input" 
              type="number" 
              min="1" 
              required
              value={quantity} 
              onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '600' }}>
            Description
          </label>
          <textarea 
            className="form-textarea" 
            style={{ minHeight: '120px', resize: 'vertical' }}
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          className="btn-primary" 
          style={{ padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
        >
          Save Changes
        </button>
      </form>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.25rem' }}>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Confirm Update</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.85rem', fontSize: '0.95rem' }}>
              Are you sure you want to save these updates to your campus listing?
            </p>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmUpdate} 
                className="btn-primary"
                style={{ flex: 1.5 }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EditResource;