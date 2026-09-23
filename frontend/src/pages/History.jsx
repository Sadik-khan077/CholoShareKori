import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const History = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/transactions/history');
        setHistory(response.data.data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  const getTransactionDetails = (tx) => {
    const isProvider = Number(tx.provider_id) === Number(user.id);
    let label = '';
    let partnerLabel = '';
    let partnerName = '';
    let partnerPhone = '';

    if (isProvider) {
      partnerLabel = "To";
      partnerName = tx.requester_name;
      partnerPhone = tx.requester_phone;
      if (tx.listing_type === 'sell') label = 'Sold';
      else if (tx.listing_type === 'lend') label = 'Lent';
      else if (tx.listing_type === 'free') label = 'Donated';
    } else {
      partnerLabel = "From";
      partnerName = tx.provider_name;
      partnerPhone = tx.provider_phone;
      if (tx.listing_type === 'sell') label = 'Bought';
      else if (tx.listing_type === 'lend') label = 'Borrowed';
      else if (tx.listing_type === 'free') label = 'Received';
    }

    return { label, partnerLabel, partnerName, partnerPhone, isProvider };
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Transaction History</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>A complete log of your completed exchanges.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.length > 0 ? history.map(tx => {
          const details = getTransactionDetails(tx);
          const totalAmount = Number(tx.price) * Number(tx.quantity);

          return (
            <div key={tx.id} className="bento-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              <div style={{ flex: 2 }}>
                <span style={{ display: 'inline-block', backgroundColor: 'var(--accent-red)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {details.label}
                </span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{tx.title} (x{tx.quantity})</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                  Date: {new Date(tx.created_at).toLocaleDateString()}
                </p>
              </div>

              <div style={{ flex: 1.5, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>{details.partnerLabel}:</strong> <Link to={`/profile/${details.isProvider ? tx.requester_id : tx.provider_id}`} style={{ color: 'white' }}>{details.partnerName}</Link><br/>
                <strong style={{ color: 'var(--text-muted)' }}>Contact:</strong> {details.partnerPhone}
              </div>

              <div style={{ flex: 1, textAlign: 'right' }}>
                <strong style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block' }}>
                  {tx.transaction_type === 'borrow_request' ? `Duration: ${tx.duration_days} Days` : `Payment: ${tx.payment_method?.toUpperCase()}`}
                </strong>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: totalAmount > 0 ? '#10b981' : 'var(--text-main)' }}>
                  {totalAmount > 0 ? `৳ ${totalAmount.toFixed(2)}` : 'Free'}
                </span>
              </div>

            </div>
          );
        }) : (
          <p style={{ color: 'var(--text-muted)' }}>No completed transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default History;