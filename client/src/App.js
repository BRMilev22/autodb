import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import axios from 'axios';

// Context
import AuthContext from './context/AuthContext';

// Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Dashboard from './components/Dashboard';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PartsList from './components/parts/PartsList';
import PartDetail from './components/parts/PartDetail';
import PartForm from './components/parts/PartForm';
import UsersList from './components/users/UsersList';
import UserForm from './components/users/UserForm';
import NotFound from './components/layout/NotFound';
import LowStockAlert from './components/parts/LowStockAlert';
import ImportExport from './components/parts/ImportExport';

// Set default axios headers
axios.defaults.baseURL = '';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set auth token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/user');
        setUser(res.data);
      } catch (err) {
        console.error('Error loading user:', err);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth', { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data?.msg || err.message);
      return false;
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Private route component
  const PrivateRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
  };

  // Admin route component
  const AdminRoute = ({ children }) => {
    if (loading) return <div>Loading...</div>;
    return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <Container className="py-4 flex-grow-1">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
              
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              
              <Route path="/parts" element={<PrivateRoute><PartsList /></PrivateRoute>} />
              <Route path="/parts/new" element={<PrivateRoute><PartForm /></PrivateRoute>} />
              <Route path="/parts/:id" element={<PrivateRoute><PartDetail /></PrivateRoute>} />
              <Route path="/parts/:id/edit" element={<PrivateRoute><PartForm /></PrivateRoute>} />
              <Route path="/low-stock" element={<PrivateRoute><LowStockAlert /></PrivateRoute>} />
              <Route path="/import-export" element={<PrivateRoute><ImportExport /></PrivateRoute>} />
              
              <Route path="/users" element={<AdminRoute><UsersList /></AdminRoute>} />
              <Route path="/users/new" element={<AdminRoute><UserForm /></AdminRoute>} />
              <Route path="/users/:id/edit" element={<AdminRoute><UserForm /></AdminRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App; 