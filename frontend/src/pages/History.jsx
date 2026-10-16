import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  IconHistory, 
  IconCalendar
} from '../components/Icons';
import { getStoredTransactions } from '../services/campusData';

const initialDemoHistory = [
  {
    id: 901,
    title: 'Casio fx-991EX ClassWiz Calculator',
    transaction_type: 'borrow_request',
    listing_type: 'lend',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    due_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    return_date: new Date(Date.now() - 86400000 * 1).toISOString(),
    duration_days: 3,
    provider_name: 'Sadik Rahman',
    provider_dept: 'CSE',
    requester_name: 'You',
    total_price: 0,
    deposit: 50,
    pickup_spot: 'TSC Cafeteria',
    rating_given: 5
  },
  {
    id: 902,
    title: 'Data Structures & Algorithm Analysis in C++',
    transaction_type: 'order',
    listing_type: 'sell',
    status: 'completed',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    provider_name: 'Nafis Iqbal',
    provider_dept: 'CSE',
    requester_name: 'You',
    total_price: 380,
    pickup_spot: 'Al-Beruni Hall Gate',
    payment_method: 'Cash on Handover',
    rating_given: 5
  },
  {
    id: 903,
    title: 'Chemistry Lab Coat (Size L)',
    transaction_type: 'borrow_request',
    listing_type: 'lend',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    duration_days: 6,
    provider_name: 'Fariha Yasmin',
    provider_dept: 'Chemistry',
    requester_name: 'You',
    total_price: 30,
    pickup_spot: 'Science Faculty',
    days_left: 5
  }
];

const History = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | active | completed

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/transactions/history');
        if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setHistory(response.data.data);
        } else {
          fallbackLocal();
        }
      } catch (error) {
        fallbackLocal();
      } finally {
        setLoading(false);
      }
    };

    const fallbackLocal = () => {
      const stored = getStoredTransactions();
      if (stored.length > 0) {
        // Merge stored with demo history
        setHistory([...stored, ...initialDemoHistory]);
      } else {
        setHistory(initialDemoHistory);
      }
    };

    fetchHistory();
  }, [user]);

  const filteredHistory = history.filter(tx => {
    if (activeTab === 'active') return tx.status === 'active' || tx.status === 'pending';
    if (activeTab === 'completed') return tx.status === 'completed';
    return true;
  });

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2.25rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem' }}>
          <IconHistory size={14} color="var(--accent-primary)" />
          <span>Campus Transaction Ledger</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.3rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Exchanges & Loan History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '0.45rem' }}>
          Track your borrowed items, due dates, past purchases, and peer ratings.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.35rem', 
        background: 'var(--bg-surface)', 
        padding: '0.35rem', 
        borderRadius: '12px', 
        width: 'fit-content', 
        border: '1px solid var(--border-subtle)', 
        boxShadow: 'var(--shadow-card)',
        marginBottom: '2rem' 
      }}>
        {[
          { id: 'all', label: `All Transactions (${history.length})` },
          { id: 'active', label: 'Active Loans & Pending' },
          { id: 'completed', label: 'Completed Trades' }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isSelected ? 'var(--accent-gradient)' : 'transparent',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading your campus transaction ledger...
        </div>
      ) : filteredHistory.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {filteredHistory.map(tx => {
            const isLoan = tx.listing_type === 'lend' || tx.transaction_type === 'borrow_request';
            const isActive = tx.status === 'active' || tx.status === 'pending';
            
            return (
              <div 
                key={tx.id} 
                className="bento-card" 
                style={{ 
                  padding: '1.45rem 1.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1.35rem',
                  borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid var(--accent-emerald)'
                }}
              >
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.45rem' }}>
                    <span className={`badge badge-${tx.listing_type || 'lend'}`}>
                      {isLoan ? 'Peer Loan' : tx.listing_type === 'free' ? 'Giveaway' : 'Order'}
                    </span>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      color: tx.status === 'completed' ? 'var(--accent-emerald-text)' : 'var(--accent-primary)',
                      background: tx.status === 'completed' ? 'var(--accent-emerald-subtle)' : 'var(--accent-primary-subtle)',
                      padding: '0.18rem 0.6rem',
                      borderRadius: '5px'
                    }}>
                      {tx.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                    {tx.resource_title || tx.title || 'Campus Resource'}
                  </h3>

                  <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>Provider: <strong style={{ color: 'var(--text-main)' }}>{tx.provider_name || 'Campus Student'}</strong></span>
                    <span>•</span>
                    <span>📍 {tx.pickup_spot || 'TSC or Hall'}</span>
                  </div>
                </div>

                {/* Right Metrics / Actions */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.45rem' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: Number(tx.total_price) === 0 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                    {Number(tx.total_price) === 0 ? 'FREE' : `৳ ${Number(tx.total_price || 0).toFixed(0)}`}
                  </div>

                  {isLoan && tx.due_date && (
                    <div style={{ fontSize: '0.8rem', color: isActive ? 'var(--accent-primary)' : 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                      <IconCalendar size={13} />
                      <span>{isActive ? `Due: ${new Date(tx.due_date).toLocaleDateString()}` : `Returned On-Time`}</span>
                    </div>
                  )}

                  {tx.rating_given && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <span>★★★★★</span>
                      <span style={{ color: 'var(--text-muted)' }}>(5.0 Rating)</span>
                    </div>
                  )}

                  {isActive && (
                    <button 
                      onClick={() => alert("Check-in return requested! The provider has been notified to inspect and confirm.")}
                      className="btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', marginTop: '0.35rem' }}
                    >
                      Request Return Check-in
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bento-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            No transactions in this filter
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', marginBottom: '1.5rem' }}>
            When you borrow equipment, buy course books, or claim free items, they appear in this ledger.
          </p>
          <Link to="/" className="btn-primary">
            Explore Campus Marketplace
          </Link>
        </div>
      )}

    </div>
  );
};

export default History;