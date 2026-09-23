import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Lend = () => {
  const { user } = useContext(AuthContext);
  const [userItems, setUserItems] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const resItems = await api.get('/resources');
        setUserItems(resItems.data.data.filter(item => item.listing_type === 'lend' && Number(item.user_id) === Number(user?.id)));
      } catch (error) {
        console.error("Error fetching items:", error);
      }

      try {
        const resRequests = await api.get('/transactions/incoming');
        // Hide completed/returned items from the active queue
        setIncomingRequests(resRequests.data.data.filter(tx => tx.transaction_type === 'borrow_request' && tx.status !== 'completed' && tx.status !== 'rejected'));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/transactions/${id}`, { status: newStatus });
      if (newStatus === 'completed' || newStatus === 'rejected') {
        setIncomingRequests(prev => prev.filter(req => req.id !== id));
        setSelectedRequest(null);
      } else {
        setIncomingRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        setSelectedRequest(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const actionButtonStyle = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', flex: 1 };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Sticky Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0', marginBottom: '1rem', position: 'sticky', top: '73px', zIndex: 990, backgroundColor: '#0f172a', boxShadow: '0 10px 15px -10px rgba(0,0,0,0.5)' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Lending Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage the items you are lending and review borrow requests.</p>
        </div>
        <Link to="/create-resource?type=lend" style={{ backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>+ New Lend Post</Link>
      </div>

      {/* SECTION 1: INCOMING REQUESTS (Moved to top) */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Incoming Borrow Requests</h3>
      <div className="bento-grid" style={{ padding: 0, marginBottom: '3rem' }}>
        {incomingRequests.length > 0 ? incomingRequests.map(req => (
          <div 
            key={req.id} 
            onClick={() => setSelectedRequest(req)}
            className="bento-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{req.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Borrower: {req.requester_name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0' }}>Status: <span style={{ color: req.status === 'approved' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{req.status}</span></p>
            <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '1rem' }}>Click to view details</p>
          </div>
        )) : <p style={{ color: 'var(--text-muted)' }}>No active borrow requests right now.</p>}
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

      {/* SECTION 2: ACTIVE LISTINGS (Moved to bottom) */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Lendable Items</h3>
      <div className="bento-grid" style={{ padding: 0, marginBottom: '3rem' }}>
        {userItems.length > 0 ? userItems.map(resource => <div key={resource.id}><ResourceCard resource={resource} /></div>) : <p style={{ color: 'var(--text-muted)' }}>You haven't listed any items to lend yet.</p>}
      </div>

      {/* TRANSACTION MODAL */}
      {selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Borrow Request Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', color: 'var(--text-main)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Borrower:</strong><br/>{selectedRequest.requester_name}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Contact:</strong><br/>{selectedRequest.requester_phone}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Item:</strong><br/>{selectedRequest.title}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Duration:</strong><br/>{selectedRequest.duration_days} Days</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Pickup Location:</strong><br/>{selectedRequest.location}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Rental Fee:</strong><br/><span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>{selectedRequest.price > 0 ? `৳ ${selectedRequest.price}` : 'Free'}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setSelectedRequest(null)} style={{ ...actionButtonStyle, backgroundColor: 'rgba(255,255,255,0.1)' }}>← Back</button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} style={{ ...actionButtonStyle, backgroundColor: 'var(--accent-red)' }}>Reject</button>
                  <button onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} style={{ ...actionButtonStyle, backgroundColor: '#10b981' }}>Approve</button>
                </>
              )}
              
              {selectedRequest.status === 'approved' && (
                <button onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')} style={{ ...actionButtonStyle, backgroundColor: '#10b981' }}>Mark as Returned</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lend;