import { useState } from 'react';
import Navbar from '../components/Navbar';

const CreateResource = () => {
  const [formData, setFormData] = useState({
    type: 'offer', title: '', description: '', category: 'food', quantity: 1, location: '', urgency: 'low'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Resource Created:', formData);
    // TODO: api.post('/resources', formData)
  };

  const inputStyle = {
    padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', width: '100%', marginBottom: '1rem'
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div className="bento-card">
          <h2 style={{ marginBottom: '1.5rem' }}>Create a Post</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ flex: 1 }}>
                Post Type
                <select style={{ ...inputStyle, marginTop: '0.5rem' }} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="offer">I am offering something</option>
                  <option value="request">I am requesting something</option>
                </select>
              </label>
            </div>
            
            <input style={inputStyle} type="text" placeholder="Title" required onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea style={{ ...inputStyle, minHeight: '100px' }} placeholder="Description" required onChange={e => setFormData({...formData, description: e.target.value})} />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <select style={inputStyle} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="food">Food</option>
                <option value="clothing">Clothing</option>
                <option value="medicine">Medicine</option>
                <option value="education materials">Education Materials</option>
              </select>
              <input style={inputStyle} type="number" min="1" placeholder="Quantity" required onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <input style={inputStyle} type="text" placeholder="Location" required onChange={e => setFormData({...formData, location: e.target.value})} />
              <select style={inputStyle} onChange={e => setFormData({...formData, urgency: e.target.value})}>
                <option value="low">Low Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="high">High Urgency</option>
              </select>
            </div>

            <button type="submit" style={{
              backgroundColor: 'var(--accent-red)', color: '#fff', padding: '1rem', width: '100%',
              borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '1rem'
            }}>
              Post Resource
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateResource;