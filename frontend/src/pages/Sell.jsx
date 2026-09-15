import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';

const Sell = () => {
  // Mock data: Items the logged-in user is selling
  const mySellItems = [
    { id: 1, type: 'Sell', title: 'Unused Textbooks', description: 'CSE first semester books.', category: 'education materials', quantity: 3, location: 'Dhanmondi', urgency: 'low', status: 'available' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>My Selling Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage the items you are currently selling.</p>
        </div>
        
        {/* Pass the type to the create page via URL state if needed, or link to a generic create page */}
        <Link to="/create-resource?type=sell" style={{
          backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          + New Sell Post
        </Link>
      </div>
      
      <div className="bento-grid" style={{ padding: 0 }}>
        {mySellItems.length > 0 ? (
          mySellItems.map(resource => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px' }}>
            You haven't listed any items for sale yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Sell;