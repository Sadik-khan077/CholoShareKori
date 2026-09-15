import { Link } from 'react-router-dom';

const ResourceCard = ({ resource }) => {
  const isOffer = resource.type === 'offer';

  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          color: isOffer ? '#4ade80' : 'var(--accent-red)',
          fontWeight: '700'
        }}>
          {resource.type} • {resource.category}
        </span>
        {resource.urgency === 'high' && (
          <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-red)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
            Urgent
          </span>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{resource.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: '1.5' }}>
          {resource.description.substring(0, 80)}...
        </p>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--text-muted)' }}>📍 {resource.location}</span>
        <span style={{ fontWeight: '600' }}>Qty: {resource.quantity}</span>
      </div>
      
      <Link to={`/resources/${resource.id}`} style={{
        marginTop: '0.5rem',
        textAlign: 'center',
        padding: '0.75rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: 'var(--text-main)',
        borderRadius: '8px',
        textDecoration: 'none',
        transition: 'background-color 0.2s'
      }}>
        View Details
      </Link>
    </div>
  );
};

export default ResourceCard;