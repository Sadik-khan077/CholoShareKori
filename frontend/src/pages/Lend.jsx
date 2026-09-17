import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Lend = () => {
  const { user } = useContext(AuthContext);
  const [userItems, setUserItems] = useState([]);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await api.get('/resources');
        // Filter: Only 'lend' items that DO belong to the logged-in user
        const filtered = response.data.data.filter(
          item => item.listing_type === 'lend' && Number(item.user_id) === Number(user?.id)
        );
        setUserItems(filtered);
      } catch (error) {
        console.error("Error fetching lend items:", error);
      }
    };
    if (user) fetchMyItems();
  }, [user]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Sticky Dashboard Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 0',
        marginBottom: '1rem',
        position: 'sticky', 
        top: '73px', 
        zIndex: 999,
        backgroundColor: '#0f172a', 
        boxShadow: '0 10px 15px -10px rgba(0,0,0,0.5)' 
      }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Lending Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage the items you are currently lending to the community.</p>
        </div>
        
        <Link to="/create-resource?type=lend" style={{
          backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem',
          borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold'
        }}>
          + New Lend Post
        </Link>
      </div>

      <div className="bento-grid" style={{ padding: 0 }}>
        {userItems.length > 0 ? (
          userItems.map(resource => (
            <div key={resource.id}>
              {/* The redundant "Posted By" text has been removed from here */}
              <ResourceCard resource={resource} />
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>You haven't listed any items to lend yet.</p>
        )}
      </div>
    </div>
  );
};

export default Lend;