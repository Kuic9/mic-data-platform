import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './AuthStyles.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
    role: '',
    phoneNumber: ''
  });
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, getRoles } = useAuth();
  const navigate = useNavigate();

  // 獲取可用角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      const roleList = await getRoles();
      setRoles(roleList);
    };
    fetchRoles();
  }, [getRoles]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // 清除錯誤信息
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('密碼確認不匹配');
      return false;
    }

    if (formData.password.length < 6) {
      setError('密碼長度至少為6位');
      return false;
    }

    if (!formData.role) {
      setError('請選擇用戶角色');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getRoleDescription = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.label : '';
  };

  const getRolePermissions = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role ? role.permissions : [];
  };

  const getPermissionLabel = (permission) => {
    const permissionLabels = {
      'read': 'Read',
      'search': 'Search',
      'modify': 'Modify',
      'analyze': 'Analyze',
      'comment': 'Add Comments',
      'data_input': 'Data Input'
    };
    return permissionLabels[permission] || permission;
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>MiC Data Platform</h1>
          <h2>User Registration</h2>
          <p>Join the Modular Integrated Construction Project Data Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Please enter username"
                minLength="3"
                maxLength="50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Please enter email address"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Please enter password (at least 6 characters)"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Please enter password again"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Please enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="organization">Organization/Company *</label>
              <input
                type="text"
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                placeholder="Please enter your organization or company"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="role">User Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Please select your role</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Please enter phone number (optional)"
              />
            </div>
          </div>

          {formData.role && (
            <div className="role-preview">
              <h4>Role Permission Preview: {getRoleDescription(formData.role)}</h4>
              <div className="permissions-list">
                {getRolePermissions(formData.role).map(permission => (
                  <span key={permission} className="permission-tag">
                    {getPermissionLabel(permission)}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login now</Link></p>
        </div>

        <div className="register-note">
          <h3>Registration Notes</h3>
          <ul>
            <li>Please ensure you provide accurate and valid personal information</li>
            <li>Select the correct user role to obtain appropriate system permissions</li>
            <li>After successful registration, you will be able to access corresponding features based on your role permissions</li>
            <li>If you need to modify your role or permissions, please contact the system administrator</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 