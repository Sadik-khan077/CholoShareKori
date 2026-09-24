import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Sell = () => {
  const { user } = useContext(AuthContext);
  const [userItems, setUserItems] = useState([]);
  const [incomingOrders, setIncomingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        const resItems = await api.get('/resources');
        setUserItems(resItems.data.data.filter(item => item.listing_type === 'sell' && Number(item.user_id) === Number(user?.id)));
      } catch (error) {
        console.error("Error fetching items:", error);
      }

      try {
        const resRequests = await api.get('/transactions/incoming');
        // BROADENED FILTER: Catches anything that isn't a borrow request
        setIncomingOrders(resRequests.data.data.filter(tx => 
          tx.transaction_type !== 'borrow_request' && 
          tx.status !== 'completed' && 
          tx.status !== 'rejected'
        ));
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
        setIncomingOrders(prev => prev.filter(req => req.id !== id));
        setSelectedOrder(null);
      } else {
        setIncomingOrders(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const actionButtonStyle = { padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', flex: 1 };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0', marginBottom: '1rem', position: 'sticky', top: '73px', zIndex: 990, backgroundColor: '#0f172a', boxShadow: '0 10px 15px -10px rgba(0,0,0,0.5)' }}>
        <div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Selling Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Manage your active listings and incoming orders.</p>
        </div>
        <Link to="/create-resource?type=sell" style={{ backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>+ New Sell Post</Link>
      </div>

      {/* RESTORED: INCOMING ORDERS SECTION */}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Incoming Orders</h3>
      <div className="bento-grid" style={{ padding: 0, marginBottom: '3rem' }}>
        {incomingOrders.length > 0 ? incomingOrders.map(order => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrder(order)}
            className="bento-card"
            style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid rgba(255,255,255,0.05)' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{order.title}</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Buyer: {order.requester_name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0' }}>Quantity: {order.quantity}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.25rem 0' }}>Status: <span style={{ color: order.status === 'approved' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>{order.status}</span></p>
            <p style={{ color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '1rem' }}>Click to view details</p>
          </div>
        )) : <p style={{ color: 'var(--text-muted)' }}>No active orders right now.</p>}
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Sellable Items</h3>
      <div className="bento-grid" style={{ padding: 0, marginBottom: '3rem' }}>
        {userItems.length > 0 ? userItems.map(resource => <div key={resource.id}><ResourceCard resource={resource} /></div>) : <p style={{ color: 'var(--text-muted)' }}>You haven't listed any items to sell yet.</p>}
      </div>

      {/* MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '500px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Order Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem', color: 'var(--text-main)' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Buyer:</strong><br/>{selectedOrder.requester_name}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Contact:</strong><br/>{selectedOrder.requester_phone}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Item:</strong><br/>{selectedOrder.title}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Quantity Ordered:</strong><br/>{selectedOrder.quantity}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Pickup Location:</strong><br/>{selectedOrder.location}</div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Total Price:</strong><br/><span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>৳ {(selectedOrder.price * selectedOrder.quantity).toFixed(2)}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ ...actionButtonStyle, backgroundColor: 'rgba(255,255,255,0.1)' }}>← Back</button>
              
              {selectedOrder.status === 'pending' && (
                <>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')} style={{ ...actionButtonStyle, backgroundColor: 'var(--accent-red)' }}>Reject</button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'approved')} style={{ ...actionButtonStyle, backgroundColor: '#10b981' }}>Approve</button>
                </>
              )}
              
              {selectedOrder.status === 'approved' && (
                <button onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')} style={{ ...actionButtonStyle, backgroundColor: '#10b981' }}>Mark as Handed Over</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sell;