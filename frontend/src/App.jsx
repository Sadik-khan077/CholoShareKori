import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Core layout and auth imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditResource from './pages/EditResource';
import Settings from './pages/Settings';
import Starred from './pages/Starred';

// Resource management imports
import ResourceDetails from './pages/ResourceDetails';
import CreateResources from './pages/CreateResources'; 
import Resources from './pages/Resources';

// The 5 New Pillar imports
import Sell from './pages/Sell';
import Buy from './pages/Buy';
import Lend from './pages/Lend';
import Borrow from './pages/Borrow';
import Free from './pages/Free';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* The 5 Core Categories */}
          <Route path="/sell" element={<Sell />} />
          <Route path="/buy" element={<Buy />} />
          <Route path="/lend" element={<Lend />} />
          <Route path="/borrow" element={<Borrow />} />
          <Route path="/free" element={<Free />} />
          
          {/* Details & Creation */}
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/:id" element={<ResourceDetails />} />
          <Route path="/create-resource" element={<CreateResources />} />
          <Route path="/edit-resource/:id" element={<EditResource />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/starred" element={<Starred />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;