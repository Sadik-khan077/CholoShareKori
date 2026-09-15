import ResourceCard from '../components/ResourceCard';
import { Link } from 'react-router-dom';

const Profile = () => {
  // Dummy user resources
  const myResources = [
    { id: 1, type: 'offer', title: '20 Meal Boxes', description: 'Freshly packed meal boxes.', category: 'food', quantity: 20, location: 'Dhanmondi', urgency: 'low', status: 'available' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>My Dashboard</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage your active offers and requests.</p>
        </div>
        <Link to="/create-resource" style={{
          backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem', 
          borderRadius: '8px', textDecoration: 'none', fontWeight: '600'
        }}>
          + New Post
        </Link>
      </div>

      <div className="bento-grid" style={{ padding: 0 }}>
        {myResources.length > 0 ? (
          myResources.map(res => <ResourceCard key={res.id} resource={res} />)
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>You haven't posted any resources yet.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;