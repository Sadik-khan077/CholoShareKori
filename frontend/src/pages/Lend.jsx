import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import ResourceCard from '../components/ResourceCard';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
  IconHandshake, 
  IconPlus, 
  IconX 
} from '../components/Icons';

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
        setIncomingRequests(resRequests.data.data.filter(tx => 
          tx.transaction_type !== 'order' && 
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

  if (!user) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div className="bento-card" style={{ padding: '3.5rem 2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <IconHandshake size={28} color="var(--accent-primary)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Lending Hub Requires Sign In</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Sign in with your campus account to track your loaned equipment and approve borrow requests.
          </p>
          <Link to="/login" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  const overdueCount = incomingRequests.filter(r => r.days_late > 0).length;

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
            <IconHandshake size={14} color="var(--accent-primary)" />
            <span>Lending & Asset Management</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>
            My Lending Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
            Track items you have loaned to peers, manage due dates, and monitor return statuses.
          </p>
        </div>

        <Link to="/create-resource?type=lend" className="btn-primary">
          <IconPlus size={16} />
          <span>New Lend Post</span>
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
            Active Lendable Items
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--text-main)' }}>
            {userItems.length}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Available for students to borrow</p>
        </div>

        <div className="bento-card" style={{ padding: '1.35rem 1.6rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Borrow Inquiries
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: 'var(--accent-primary)' }}>
            {incomingRequests.filter(r => r.status === 'pending').length}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Pending your review</p>
        </div>

        <div className="bento-card" style={{ padding: '1.35rem 1.6rem', borderColor: overdueCount > 0 ? 'var(--accent-rose)' : undefined }}>
          <span style={{ fontSize: '0.82rem', color: overdueCount > 0 ? 'var(--accent-rose-text)' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Overdue Loans
          </span>
          <div style={{ fontSize: '2.1rem', fontWeight: '800', marginTop: '0.35rem', color: overdueCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            {overdueCount}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {overdueCount > 0 ? 'Action required: Overdue grace period active' : 'All active loans on schedule'}
          </p>
        </div>
      </div>

      {/* SECTION 1: INCOMING REQUESTS */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.35rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)' }}>Incoming Borrow Requests</h2>
          {incomingRequests.length > 0 && (
            <span style={{ 
              backgroundColor: 'var(--accent-primary-subtle)', 
              color: 'var(--accent-primary)', 
              padding: '0.22rem 0.7rem', 
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: '700'
            }}>
              {incomingRequests.length}
            </span>
          )}
        </div>

        {incomingRequests.length > 0 ? (
          <div className="bento-grid">
            {incomingRequests.map(req => {
              const isOverdue = req.days_late > 0;
              return (
                <div 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="bento-card"
                  style={{ 
                    cursor: 'pointer', 
                    border: isOverdue ? '1px solid var(--accent-rose)' : req.status === 'pending' ? '1px solid var(--accent-primary-border)' : '1px solid var(--border-subtle)',
                    backgroundColor: isOverdue ? 'var(--accent-rose-subtle)' : undefined,
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
                        backgroundColor: isOverdue ? 'var(--accent-rose-subtle)' : req.status === 'approved' ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)',
                        color: isOverdue ? 'var(--accent-rose-text)' : req.status === 'approved' ? 'var(--accent-emerald-text)' : 'var(--accent-amber-text)'
                      }}>
                        {isOverdue ? `Overdue by ${req.days_late}d` : req.status}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {req.duration_days ? `${req.duration_days} days loan` : 'Standard Loan'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                      {req.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Borrower: </span>
                        <strong>{req.requester_name}</strong>
                      </div>
                      {req.due_date && req.status === 'approved' && (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Due Date: </span>
                          <strong style={{ color: isOverdue ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                            {new Date(req.due_date).toLocaleDateString()}
                          </strong>
                        </div>
                      )}
                      {isOverdue && (
                        <div style={{ color: 'var(--accent-rose-text)', fontWeight: '700' }}>
                          Late Penalty: ৳ {Number(req.late_fee).toFixed(2)}
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
                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: Number(req.price) > 0 ? 'var(--accent-primary)' : 'var(--accent-emerald)' }}>
                      {Number(req.price) > 0 ? `৳ ${req.price}` : 'Free Loan'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                      Manage Request →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bento-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              No active borrow requests at the moment. When classmates request your items, they will appear here.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIVE LISTINGS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.65rem', fontWeight: '700', color: 'var(--text-main)' }}>My Lendable Items</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {userItems.length} active listings
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
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>You haven't listed any items to lend</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              Help campus peers by lending tools, scientific equipment, books, or sports gear.
            </p>
            <Link to="/create-resource?type=lend" className="btn-primary">
              <IconPlus size={16} />
              <span>List Your First Lendable Item</span>
            </Link>
          </div>
        )}
      </div>

      {/* TRANSACTION MODAL */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '490px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--text-main)' }}>Borrow Request Details</h3>
                <span style={{ 
                  display: 'inline-block',
                  fontSize: '0.78rem', 
                  fontWeight: '700', 
                  textTransform: 'uppercase', 
                  padding: '0.22rem 0.65rem',
                  borderRadius: '9999px',
                  marginTop: '0.35rem',
                  backgroundColor: selectedRequest.days_late > 0 ? 'var(--accent-rose-subtle)' : selectedRequest.status === 'approved' ? 'var(--accent-emerald-subtle)' : 'var(--accent-amber-subtle)',
                  color: selectedRequest.days_late > 0 ? 'var(--accent-rose-text)' : selectedRequest.status === 'approved' ? 'var(--accent-emerald-text)' : 'var(--accent-amber-text)'
                }}>
                  {selectedRequest.days_late > 0 ? `Overdue by ${selectedRequest.days_late} Days` : `Status: ${selectedRequest.status}`}
                </span>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="btn-ghost" style={{ padding: '0.4rem' }}>
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
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Borrower</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedRequest.requester_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Contact Phone</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{selectedRequest.requester_phone || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Item Title</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedRequest.title}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Pickup Spot</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedRequest.location}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Duration</span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedRequest.duration_days ? `${selectedRequest.duration_days} Days` : 'N/A'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem', fontWeight: 600 }}>Rental Fee</span>
                <strong style={{ color: Number(selectedRequest.price) > 0 ? 'var(--accent-primary)' : 'var(--accent-emerald)' }}>
                  {Number(selectedRequest.price) > 0 ? `৳ ${selectedRequest.price}` : 'Free'}
                </strong>
              </div>

              {selectedRequest.days_late > 0 && (
                <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--accent-rose-subtle)', padding: '0.9rem', borderRadius: '10px', border: '1px solid var(--accent-rose)' }}>
                  <div style={{ color: 'var(--accent-rose-text)', fontWeight: '700', fontSize: '0.85rem' }}>⚠️ Late Penalty Accrued:</div>
                  <div style={{ color: 'var(--accent-rose-text)', fontWeight: '800', fontSize: '1.3rem', marginTop: '0.2rem' }}>
                    ৳ {Number(selectedRequest.late_fee).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="btn-secondary" 
                style={{ flex: 1 }}
              >
                Back
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'rejected')} 
                    className="btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--accent-rose)', color: 'var(--accent-rose-text)' }}
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'approved')} 
                    className="btn-primary"
                    style={{ flex: 1.5, background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #166534 100%)' }}
                  >
                    Approve Loan
                  </button>
                </>
              )}
              
              {selectedRequest.status === 'approved' && (
                <button 
                  onClick={() => handleUpdateStatus(selectedRequest.id, 'completed')} 
                  className="btn-primary"
                  style={{ flex: 2, background: 'linear-gradient(135deg, var(--accent-emerald) 0%, #166534 100%)' }}
                >
                  Confirm Item Returned ✓
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Lend;