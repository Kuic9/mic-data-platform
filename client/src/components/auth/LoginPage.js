import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthStyles.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error message
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>MiC Data Platform</h1>
          <h2>User Login</h2>
          <p>Modular Integrated Construction Project Data Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username or Email</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Please enter username or email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Please enter password"
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register now</Link></p>
        </div>

        <div className="role-description">
          <h3>Platform User Role Description</h3>
          <div className="role-grid">
            <div className="role-item">
              <h4>Designer</h4>
              <p>Has complete data read, search, modify, analyze and comment permissions</p>
            </div>
            <div className="role-item">
              <h4>Developer</h4>
              <p>Can read, search and analyze project data</p>
            </div>
            <div className="role-item">
              <h4>Policy Maker</h4>
              <p>Can read, search and analyze project data</p>
            </div>
            <div className="role-item">
              <h4>Contractor</h4>
              <p>Can read, search and analyze project data</p>
            </div>
            <div className="role-item">
              <h4>Manufacturer</h4>
              <p>Can read, search and modify related module data</p>
            </div>
            <div className="role-item">
              <h4>Subcontractor</h4>
              <p>Can read and search project data</p>
            </div>
            <div className="role-item">
              <h4>Supplier</h4>
              <p>Can only read basic project information</p>
            </div>
            <div className="role-item">
              <h4>Operator</h4>
              <p>Can read, search and modify operation-related data</p>
            </div>
            <div className="role-item">
              <h4>System Administrator</h4>
              <p>Has all permissions including data input and system management</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 