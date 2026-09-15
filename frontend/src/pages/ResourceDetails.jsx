import { useParams, useNavigate } from 'react-router-dom';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock detailed data
  const resource = {
    id, type: 'offer', title: '20 Meal Boxes', description: 'Freshly packed meal boxes available for pickup today. Includes rice, lentils, and vegetables. Please contact me before arriving.', category: 'food', quantity: 20, location: 'Dhanmondi', urgency: 'low', status: 'available', providerName: 'Sadik Khan'
  };

  return (
    // <Navbar /> has been removed from here!
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Dynamic Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          background: 'none', border: 'none', color: 'var(--accent-red)', 
          cursor: 'pointer', padding: 0, fontSize: '1rem', 
          marginBottom: '1.5rem', display: 'inline-block' 
        }}
      >
        ← Back
      </button>
      
      <div className="bento-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ color: '#4ade80', fontWeight: '700', textTransform: 'uppercase' }}>{resource.type}</span>
          <span style={{ color: 'var(--text-muted)' }}>Posted by {resource.providerName}</span>
        </div>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{resource.title}</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>{resource.description}</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Category</p>
            <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>{resource.category}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Quantity</p>
            <p style={{ fontWeight: '600' }}>{resource.quantity}</p>
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Location</p>
            <p style={{ fontWeight: '600' }}>{resource.location}</p>
          </div>
        </div>

        <button style={{
          backgroundColor: 'var(--accent-red)', color: '#fff', padding: '1rem', width: '100%',
          borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', marginTop: '2rem'
        }}>
          Request Match
        </button>
      </div>
    </div>
  );
};

export default ResourceDetails;