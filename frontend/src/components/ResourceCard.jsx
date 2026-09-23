import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ResourceCard = ({ resource }) => {
  const { user } = useContext(AuthContext);
  const [requestStatus, setRequestStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form States
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [duration, setDuration] = useState(1);
  const [policyAccepted, setPolicyAccepted] = useState(false);

  const isOwner = Number(user?.id) === Number(resource.user_id);

  const handleTransactionRequest = async () => {
    if (!user) return alert("Please login to request items.");
    
    setRequestStatus('loading');
    try {
      const payload = {
        resource_id: resource.id,
        provider_id: resource.user_id,
        transaction_type: resource.listing_type === 'sell' ? 'order' : 'borrow_request',
        quantity: resource.listing_type === 'sell' ? quantity : 1,
        payment_method: resource.listing_type === 'sell' ? paymentMethod : null,
        duration_days: resource.listing_type === 'lend' ? duration : null
      };

      await api.post('/transactions', payload);
      setRequestStatus('success');
      setIsModalOpen(false); // Close modal on success
    } catch (error) {
      setRequestStatus('error');
      alert(error.response?.data?.message || "Failed to send request.");
    }
  };

  const openModal = () => {
    if (!user) return alert("Please login to interact with items.");
    setIsModalOpen(true);
  };

  const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)', color: 'var(--text-main)', marginBottom: '1rem', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' };

  return (
    <>
      <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{resource.title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>{resource.description}</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>📍 {resource.location}</span>
          <span style={{ fontWeight: 'bold' }}>Qty: {resource.quantity}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', fontSize: '1.25rem' }}>
            {resource.price > 0 ? `৳ ${Number(resource.price).toFixed(2)}` : 'Free'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
            View Details
          </button>
          
          {isOwner ? (
            <Link to={`/edit-resource/${resource.id}`} style={{ flex: 1, textAlign: 'center', backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              Edit Post
            </Link>
          ) : (
            <button 
              onClick={requestStatus === 'success' ? null : openModal}
              disabled={requestStatus === 'loading'}
              style={{ 
                flex: 1, 
                backgroundColor: requestStatus === 'success' ? '#10b981' : 'var(--accent-red)', 
                color: 'white', border: 'none', padding: '0.5rem', borderRadius: '8px', 
                cursor: requestStatus === 'success' ? 'default' : 'pointer', fontWeight: 'bold'
              }}
            >
              {requestStatus === 'success' ? 'Request Sent ✓' : resource.listing_type === 'sell' ? 'Order Now' : 'Send Request'}
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div className="bento-card" style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              {resource.listing_type === 'sell' ? 'Confirm Order' : 'Borrow Request'}
            </h3>

            {resource.listing_type === 'sell' && (
              <>
                <label style={labelStyle}>Quantity (Max: {resource.quantity})</label>
                <input type="number" min="1" max={resource.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} style={inputStyle} />
                
                <label style={labelStyle}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={inputStyle}>
                  <option value="cod" style={{ background: '#1f2937' }}>Cash on Delivery</option>
                  <option value="bkash" style={{ background: '#1f2937' }}>bKash</option>
                  <option value="nagad" style={{ background: '#1f2937' }}>Nagad</option>
                </select>
              </>
            )}

            {resource.listing_type === 'lend' && (
              <>
                <label style={labelStyle}>Duration (Days)</label>
                <input type="number" min="1" max="30" value={duration} onChange={(e) => setDuration(e.target.value)} style={inputStyle} />
                
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={policyAccepted} onChange={(e) => setPolicyAccepted(e.target.checked)} style={{ marginTop: '0.2rem' }} />
                  I agree to the late fee policy. Overdue returns will incur penalty charges as set by the lender.
                </label>
              </>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button 
                onClick={handleTransactionRequest} 
                disabled={resource.listing_type === 'lend' && !policyAccepted}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: (resource.listing_type === 'lend' && !policyAccepted) ? 'gray' : 'var(--accent-red)', color: 'white', cursor: (resource.listing_type === 'lend' && !policyAccepted) ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResourceCard;