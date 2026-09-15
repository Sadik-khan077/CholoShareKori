import { useNavigate } from 'react-router-dom';

const ResourceCard = ({ resource }) => {
  // 1. Initialize navigate here so the buttons know how to use it
  const navigate = useNavigate();

  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      
      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{resource.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          {/* Added optional chaining (?) to prevent crashes if description is missing */}
          {resource.description?.substring(0, 80)}...
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>📍 {resource.location}</span>
        <span style={{ fontWeight: '600' }}>Qty: {resource.quantity}</span>
      </div>

      {/* 2. Moved the action buttons cleanly to the bottom */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => navigate(`/resources/${resource.id}`)}
          style={{
            flex: 1, padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
          View Details
        </button>

        <button
          onClick={() => navigate(`/edit-resource/${resource.id}`)}
          style={{
            flex: 1, padding: '0.75rem', backgroundColor: 'var(--accent-red)',
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
          Edit Post
        </button>
      </div>
    </div>
  );
};

export default ResourceCard;