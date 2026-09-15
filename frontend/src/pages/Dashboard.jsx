import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div style={{ 
      padding: '0 2rem', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 100px)' 
    }}>
      
      {/* Centered Hero Section */}
      <div style={{ textAlign: 'center', marginTop: '-10vh' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', fontWeight: '700' }}>
          Community Resource Sharing <br/><span style={{ color: 'var(--accent-red)' }}>Made Easy</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
          CholoShareKori connects you directly with your local community. Trade essentials, support other students, and reduce waste through a secure, localized network. Login or Register and select a category above to get started.
        </p>
      </div>

    </div>
  );
};

export default Dashboard;