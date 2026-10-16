import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import { 
  IconMapPin, 
  IconShieldCheck, 
  IconStar, 
  IconStarFilled, 
  IconShare, 
  IconCalendar,
  IconCheck
} from '../components/Icons';
import { 
  getStoredCampusListings, 
  isItemStarred, 
  toggleStoredStar, 
  recordLocalTransaction 
} from '../services/campusData';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [resource, setResource] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starred, setStarred] = useState(false);
  
  // Interactive action panel states
  const [duration, setDuration] = useState(7);
  const [quantity, setQuantity] = useState(1);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      setRequestSent(false);
      try {
        const response = await api.get(`/resources/${id}`);
        if (response.data?.data) {
          setResource(response.data.data);
        } else {
          fallbackLocal();
        }
      } catch (err) {
        fallbackLocal();
      } finally {
        setLoading(false);
      }
    };

    const fallbackLocal = () => {
      const all = getStoredCampusListings();
      const found = all.find(item => Number(item.id) === Number(id));
      if (found) {
        setResource(found);
        setSimilarItems(all.filter(i => i.category === found.category && Number(i.id) !== Number(found.id)).slice(0, 3));
      }
    };

    fetchResource();
    setStarred(isItemStarred(Number(id)));
  }, [id]);

  const handleToggleStar = () => {
    if (!resource) return;
    const res = toggleStoredStar(resource.id);
    setStarred(res.isStarred);
    window.dispatchEvent(new Event('csk_starred_updated'));
  };

  const handleRequest = async () => {
    if (!user) {
      alert("Please sign in or use the 'Demo Student' pilot in the navigation bar.");
      return;
    }

    setSubmitting(true);
    const payload = {
      resource_id: resource.id,
      resource_title: resource.title,
      provider_id: resource.user_id,
      provider_name: resource.user_name || 'Campus Peer',
      requester_id: user.id,
      requester_name: user.name,
      requester_phone: user.phone || '+880 1700-000000',
      transaction_type: resource.listing_type === 'sell' ? 'order' : resource.listing_type === 'free' ? 'claim' : 'borrow_request',
      listing_type: resource.listing_type,
      quantity: resource.listing_type === 'sell' ? Number(quantity) : 1,
      duration_days: resource.listing_type === 'lend' ? Number(duration) : null,
      pickup_spot: resource.pickup_spot || resource.location || 'TSC Cafeteria',
      total_price: resource.listing_type === 'sell' ? Number(resource.price) * Number(quantity) : Number(resource.price)
    };

    try {
      await api.post('/transactions', payload);
      recordLocalTransaction(payload);
      setRequestSent(true);
    } catch (err) {
      // Local sync fallback ensures zero friction
      recordLocalTransaction(payload);
      setRequestSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px', marginBottom: '1rem' }} />
        <p>Loading campus resource profile...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--accent-rose)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Resource not found.</p>
        <Link to="/" className="btn-primary">Back to Campus Marketplace</Link>
      </div>
    );
  }

  const isOwner = user && Number(user.id) === Number(resource.user_id);
  const priceNum = Number(resource.price) || 0;
  const isFree = resource.listing_type === 'free' || priceNum === 0;

  // Live Date math
  const dueDate = new Date(Date.now() + Number(duration) * 86400000);
  const formattedDueDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div style={{ padding: '2.5rem 1.5rem 5rem', maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      
      {/* Back Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn-ghost" 
          style={{ paddingLeft: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}
        >
          ← Back to Marketplace
        </button>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button 
            onClick={handleToggleStar} 
            className="btn-secondary"
            style={{ padding: '0.5rem 0.95rem', fontSize: '0.86rem', color: starred ? 'var(--accent-amber)' : 'var(--text-secondary)' }}
          >
            {starred ? <IconStarFilled size={16} color="var(--accent-amber)" /> : <IconStar size={16} />}
            <span>{starred ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
          
          <button 
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              alert("Listing link copied to clipboard!");
            }} 
            className="btn-secondary"
            style={{ padding: '0.5rem 0.95rem', fontSize: '0.86rem' }}
          >
            <IconShare size={15} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Details + Action Rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Resource Profile */}
        <div className="bento-card" style={{ padding: '2.25rem' }}>
          
          {/* Top Metadata Rail */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.35rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${resource.listing_type}`}>
              {resource.listing_type}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-subtle)', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              Category: <strong style={{ color: 'var(--text-main)' }}>{resource.category}</strong>
            </span>
            {resource.urgency && resource.urgency !== 'low' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--accent-rose-text)', background: 'var(--accent-rose-subtle)', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid var(--accent-rose)' }}>
                <span className="pulse-dot critical" style={{ width: '6px', height: '6px' }} />
                <span>Urgent Need</span>
              </span>
            )}
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3, marginBottom: '0.85rem' }}>
            {resource.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.85rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <IconMapPin size={15} color="var(--accent-primary)" />
              <span>{resource.location}</span>
            </span>
            <span>•</span>
            <span>Posted {new Date(resource.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Condition: <strong style={{ color: 'var(--text-main)' }}>{resource.condition || 'Good Condition'}</strong></span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-main)' }}>
              Resource Description & Notes
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {resource.description}
            </p>
          </div>

          {/* Handover & Location Guide */}
          <div style={{ 
            backgroundColor: 'var(--accent-primary-subtle)', 
            border: '1px solid var(--accent-primary-border)', 
            borderRadius: '14px', 
            padding: '1.35rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <IconMapPin size={16} />
              <span>Designated Meetup Point</span>
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>
              Handover recommended at: <strong>{resource.pickup_spot || resource.location || 'TSC or Bottola'}</strong>.
              Contact provider directly via student WhatsApp or meetup message upon request approval.
            </p>
          </div>

          {/* Safety Checklist */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <IconShieldCheck size={17} color="var(--accent-emerald)" />
              <span>Campus Peer Trust Guidelines</span>
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span> Inspect calculators/devices before leaving the meetup spot
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span> Return borrowed books and tools within the agreed loan timeline
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>✓</span> Timely returns boost your Campus Karma Score & Trust badge
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Provider Card + Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          
          {/* Action Box */}
          <div className="bento-card" style={{ padding: '1.65rem' }}>
            <div style={{ marginBottom: '1.35rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                {resource.listing_type === 'lend' ? 'Loan Rate' : 'Price'}
              </span>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: isFree ? 'var(--accent-emerald)' : 'var(--text-main)', marginTop: '0.2rem' }}>
                {isFree ? 'FREE' : `৳ ${priceNum.toFixed(0)}`}
                {resource.listing_type === 'lend' && !isFree && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '0.35rem' }}>/loan</span>
                )}
              </div>
            </div>

            {/* If Borrowable: Interactive Slider & Due Date Math */}
            {resource.listing_type === 'lend' && !requestSent && (
              <div style={{ marginBottom: '1.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '0.45rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Duration: <strong>{duration} Days</strong></span>
                  <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <IconCalendar size={13} /> Due: {formattedDueDate}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="14" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
                
                <label style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.95rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={policyAccepted} 
                    onChange={(e) => setPolicyAccepted(e.target.checked)} 
                    style={{ marginTop: '0.15rem', accentColor: 'var(--accent-primary)' }} 
                  />
                  <span>I agree to return this item on time to preserve high peer trust.</span>
                </label>
              </div>
            )}

            {/* If Selling: Quantity */}
            {resource.listing_type === 'sell' && !requestSent && (
              <div style={{ marginBottom: '1.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                  Quantity:
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={resource.quantity || 1} 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="form-input" 
                />
              </div>
            )}

            {/* Submission Status */}
            {requestSent ? (
              <div style={{ 
                background: 'var(--accent-emerald-subtle)', 
                border: '1px solid rgba(37, 122, 84, 0.3)', 
                borderRadius: '10px', 
                padding: '1.15rem',
                textAlign: 'center',
                color: 'var(--accent-emerald-text)'
              }}>
                <IconCheck size={24} color="var(--accent-emerald)" style={{ margin: '0 auto 0.4rem' }} />
                <strong style={{ display: 'block', fontSize: '1rem' }}>Request Sent to Peer!</strong>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Check your Exchanges & Loans page for approval updates.
                </p>
                <Link to="/history" className="btn-secondary" style={{ marginTop: '0.85rem', width: '100%', fontSize: '0.84rem' }}>
                  View in My History →
                </Link>
              </div>
            ) : isOwner ? (
              <Link to={`/edit-resource/${resource.id}`} className="btn-secondary" style={{ width: '100%' }}>
                Edit Your Post
              </Link>
            ) : (
              <button 
                onClick={handleRequest}
                disabled={submitting || (resource.listing_type === 'lend' && !policyAccepted)}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.8rem',
                  opacity: (resource.listing_type === 'lend' && !policyAccepted) ? 0.5 : 1 
                }}
              >
                {submitting ? 'Submitting...' : resource.listing_type === 'sell' ? 'Place Order' : resource.listing_type === 'free' ? 'Claim This Free Item' : 'Request to Borrow'}
              </button>
            )}

          </div>

          {/* Peer Provider Card */}
          <div className="bento-card" style={{ padding: '1.65rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              Listed By University Peer
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', marginTop: '0.85rem', marginBottom: '1.15rem' }}>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                background: 'var(--accent-gradient)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.15rem'
              }}>
                {resource.user_name ? resource.user_name.charAt(0) : 'S'}
              </div>
              <div>
                <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {resource.user_name || 'Campus Student'}
                </h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {resource.user_dept || 'Jahangirnagar University'}
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.65rem', 
              padding: '0.85rem', 
              borderRadius: '10px', 
              background: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.15rem',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                  {resource.trust_score || 99}%
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Peer Trust</div>
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                  {resource.user_batch || 'Verified'}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Student ID</div>
              </div>
            </div>

            <Link 
              to={`/profile/${resource.user_id}`} 
              className="btn-ghost" 
              style={{ width: '100%', justifyContent: 'center', fontSize: '0.86rem' }}
            >
              View Full Student Profile →
            </Link>
          </div>

        </div>

      </div>

      {/* Similar Campus Resources */}
      {similarItems.length > 0 && (
        <div style={{ marginTop: '4.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-main)' }}>
              More in {resource.category}
            </h3>
            <Link to="/" style={{ color: 'var(--accent-primary)', fontSize: '0.88rem', textDecoration: 'none', fontWeight: 700 }}>
              Browse All →
            </Link>
          </div>
          <div className="bento-grid">
            {similarItems.map(item => (
              <ResourceCard key={item.id} resource={item} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResourceDetails;