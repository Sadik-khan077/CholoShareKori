import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ResourceCard = ({ resource }) => {
  const { user } = useContext(AuthContext);
  
  // Strict comparison: cast both to Numbers to prevent string/int mismatch bugs
  const isOwner = Number(user?.id) === Number(resource.user_id);

  return (
    <div className="bento-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{resource.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {resource.description || 'No description provided.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>📍 {resource.location}</span>
        <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Qty: {resource.quantity}</span>
      </div>

      {resource.price !== null && resource.price > 0 && (
        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>
          ৳ {resource.price}
        </div>
      )}

      {/* Dynamic Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem' }}>
        <button style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
          View Details
        </button>
        
        {isOwner ? (
          <Link to={`/edit-resource/${resource.id}`} style={{ flex: 1, textAlign: 'center', backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
            Edit Post
          </Link>
        ) : (
          <button style={{ flex: 1, backgroundColor: 'var(--accent-red)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {resource.listing_type === 'sell' ? 'Confirm Order' : 'Send Request'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceCard;