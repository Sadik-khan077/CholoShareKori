import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';

const Lend = () => {
  // Mock data: Items the logged-in user is lending
  const myLendItems = [
    { id: 4, type: 'Lend', title: 'Power Drill Set', description: 'Complete power drill set with multiple bits. Available to lend for up to 3 days.', category: 'tools', quantity: 1, location: 'Dhanmondi', urgency: 'low', status: 'available' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Lending Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage the items you are currently lending to the community.</p>
        </div>
        
        <Link to="/create-resource?type=lend" style={{
          backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          + New Lend Post
        </Link>
      </div>
      
      <div className="bento-grid" style={{ padding: 0 }}>
        {myLendItems.length > 0 ? (
          myLendItems.map(resource => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            You haven't listed any items to lend yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Lend;