import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Core layout and auth imports
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import EditResource from './pages/EditResource';

// Resource management imports
import ResourceDetails from './pages/ResourceDetails';
import CreateResources from './pages/CreateResources'; 

// The 5 New Pillar imports
import Sell from './pages/Sell';
import Buy from './pages/Buy';
import Lend from './pages/Lend';
import Borrow from './pages/Borrow';
import Free from './pages/Free';

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
          <Route path="/resources/:id" element={<ResourceDetails />} />
          <Route path="/create-resource" element={<CreateResources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-resource/:id" element={<EditResource />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;