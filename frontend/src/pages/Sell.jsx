import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  IconShoppingBag, 
  IconPlus, 
  IconX 
} from '../components/Icons';

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
        const resOrders = await api.get('/transactions/incoming');
        setIncomingOrders(resOrders.data.data.filter(tx => 
          tx.transaction_type === 'order' && 
          tx.status !== 'completed' && 
          tx.status !== 'rejected'
        ));
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchData();
  }, [user]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/transactions/${id}`, { status: newStatus });
      if (newStatus === 'completed' || newStatus === 'rejected') {
        setIncomingOrders(prev => prev.filter(order => order.id !== id));
        setSelectedOrder(null);
      } else {
        setIncomingOrders(prev => prev.map(order => order.id === id ? { ...order, status: newStatus } : order));
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="bento-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <IconShoppingBag size={28} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Seller Portal Requires Sign In</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Sign in to track orders for your books, calculators, and dorm gear.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const pendingCount = incomingOrders.filter(o => o.status === 'pending').length;

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1260px', margin: '0 auto', width: '100%' }}>
      
      {/* Top Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap', 
        gap: '1.75rem', 
        marginBottom: '2.25rem' 
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.45rem' }}>
            <IconShoppingBag size={14} color="var(--accent-primary)" />
            <span>Seller Command Center</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>
            My Selling Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
            Manage active marketplace listings, review incoming campus orders, and hand over items.
          </p>
        </div>

        <Link to="/create-resource?type=sell" className="btn-primary">
          <IconPlus size={16} />
          <span>New Sell Post</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '1.25rem', 
        marginBottom: '2.75rem' 
      }}>
        <div className="bento-card" style={{ padding: '1.35rem 1.6rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Active Listings
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--text-main)' }}>
            {userItems.length}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Currently listed in marketplace</p>
        </div>

        <div className="bento-card" style={{ padding: '1.35rem 1.6rem', borderColor: pendingCount > 0 ? 'var(--accent-primary-border)' : undefined }}>
          <span style={{ fontSize: '0.82rem', color: pendingCount > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Orders Awaiting Approval
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: pendingCount > 0 ? 'var(--accent-primary)' : 'var(--text-main)' }}>
            {pendingCount}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Requires your confirmation</p>
        </div>

        <div className="bento-card" style={{ padding: '1.35rem 1.6rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Active In-Progress
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--accent-emerald)' }}>
            {incomingOrders.filter(o => o.status === 'approved').length}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Approved, ready for meetup</p>
        </div>
      </div>

      {/* SECTION: INCOMING ORDERS */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.35rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)' }}>Incoming Buyer Orders</h2>
          {incomingOrders.length > 0 && (
            <span style={{ 
              backgroundColor: 'var(--accent-primary-subtle)', 
              color: 'var(--accent-primary)', 
              padding: '0.22rem 0.7rem', 
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {incomingOrders.length}
            </span>
          )}
        </div>

        {incomingOrders.length > 0 ? (
          <div className="bento-grid">
            {incomingOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="bento-card"
                style={{ 
                  cursor: 'pointer', 
                  border: order.status === 'pending' ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: '700', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.04em',
                      padding: '0.28rem 0.7rem',
                      borderRadius: '9999px',
                      backgroundColor: order.status === 'approved' ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)',
                      color: order.status === 'approved' ? 'var(--accent-emerald-text)' : 'var(--accent-amber-text)'
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    {order.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Buyer: </span>
                      <strong>{order.requester_name}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Quantity: </span>
                      <strong>{order.quantity} units</strong>
                    </div>
                    {order.payment_method && (
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Payment: </span>
                        <strong style={{ textTransform: 'uppercase' }}>{order.payment_method}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingTop: '0.85rem', 
                  borderTop: '1px solid var(--border-subtle)' 
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>
                    ৳ {(Number(order.price) * Number(order.quantity)).toFixed(2)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    Manage Order →
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bento-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No active incoming orders right now. New requests will appear here when students order your items.
            </p>
          </div>
        )}
      </div>

      {/* SECTION: MY SELLABLE ITEMS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)' }}>My Listed Items</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {userItems.length} active posts
          </span>
        </div>

        {userItems.length > 0 ? (
          <div className="bento-grid">
            {userItems.map(resource => (
              <div key={resource.id}>
                <ResourceCard resource={resource} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bento-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>You haven't listed any items for sale</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Post textbooks, lab kits, or electronic gadgets you no longer need.
            </p>
            <Link to="/create-resource?type=sell" className="btn-primary">
              <IconPlus size={16} />
              <span>Create Your First Listing</span>
            </Link>
          </div>
        )}
      </div>

      {/* ORDER DETAILS & ACTION MODAL */}
      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '490px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>Order Details</h3>
                <span style={{ 
                  display: 'inline-block',
                  fontSize: '0.78rem', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  padding: '0.22rem 0.65rem',
                  borderRadius: '9999px',
                  marginTop: '0.35rem',
                  backgroundColor: selectedOrder.status === 'approved' ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)',
                  color: selectedOrder.status === 'approved' ? 'var(--accent-emerald-text)' : 'var(--accent-amber-text)'
                }}>
                  Status: {selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="btn-ghost" style={{ padding: '0.4rem' }}>
                <IconX size={20} />
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1.1rem', 
              backgroundColor: 'var(--bg-surface-subtle)',
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.75rem',
              fontSize: '0.9rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Buyer Name</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.requester_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Phone / WhatsApp</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{selectedOrder.requester_phone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Item Ordered</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.title}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Quantity</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.quantity} units</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Meetup Location</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.location}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Total Amount</span>
                <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem', fontWeight: 800 }}>
                  ৳ {(Number(selectedOrder.price) * Number(selectedOrder.quantity)).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="btn-secondary" 
                style={{ flex: 1 }}
              >
                Back
              </button>
              
              {selectedOrder.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'rejected')} 
                    className="btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose-text)' }}
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'approved')} 
                    className="btn-primary"
                    style={{ flex: 1.5, background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #166534 100%)' }}
                  >
                    Approve Order
                  </button>
                </>
              )}
              
              {selectedOrder.status === 'approved' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')} 
                  className="btn-primary"
                  style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #166534 100%)' }}
                >
                  Mark as Handed Over ✓
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Sell;