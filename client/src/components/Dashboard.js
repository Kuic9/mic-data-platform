import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from './auth/ProtectedRoute';
import { Link, useNavigate } from 'react-router-dom';
import DataManagement from './DataManagement';
import DataUpload from './DataUpload';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, hasPermission, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await logout();
  };

  const handleMicModuleSearch = () => {
    navigate('/modules');
  };

  // Fetch project data
  const fetchProjects = async () => {
    if (!hasPermission('read')) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/projects', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to fetch project data');
      }
    } catch (err) {
      setError('Network error, please try again later');
      console.error('Error fetching project data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch module data
  const fetchModules = async () => {
    if (!hasPermission('read')) return;
    
    try {
      const response = await fetch('/api/modules', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.slice(0, 10)); // Only show first 10 modules
      }
    } catch (err) {
      console.error('Error fetching module data:', err);
    }
  };

  // 組件加載時獲取數據
  useEffect(() => {
    if (user && hasPermission('read')) {
      fetchProjects();
      fetchModules();
    }
  }, [user]);

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

  const getRoleLabel = (role) => {
    const roleLabels = {
      'designer': 'Designer',
      'developer': 'Developer',
      'policy_maker': 'Policy Maker',
      'contractor': 'Contractor',
      'manufacturer': 'Manufacturer',
      'subcontractor': 'Subcontractor',
      'supplier': 'Supplier',
      'operator': 'Operator',
      'admin': 'System Administrator'
    };
    return roleLabels[role] || role;
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>MiC Data Platform</h1>
          <div className="user-info">
            <span>Welcome, {user.fullName}</span>
            <span className="user-role">({getRoleLabel(user.role)})</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="dashboard-nav">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          <PermissionGate permission="read">
            <button 
              className={activeTab === 'projects' ? 'active' : ''}
              onClick={() => setActiveTab('projects')}
            >
              Project Data
            </button>
          </PermissionGate>

          <PermissionGate permission="search">
            <button 
              className={activeTab === 'search' ? 'active' : ''}
              onClick={() => setActiveTab('search')}
            >
              MiC Module Search
            </button>
          </PermissionGate>

          <PermissionGate permission="modify">
            <button 
              className={activeTab === 'manage' ? 'active' : ''}
              onClick={() => setActiveTab('manage')}
            >
              Data Management
            </button>
          </PermissionGate>

          <PermissionGate permission="data_input">
            <button 
              className={activeTab === 'upload' ? 'active' : ''}
              onClick={() => setActiveTab('upload')}
            >
              Data Upload
            </button>
          </PermissionGate>

          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </nav>

        <main className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <h2>Dashboard Overview</h2>
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>User Information</h3>
                  <div className="user-details">
                    <p><strong>Name:</strong> {user.fullName}</p>
                    <p><strong>Role:</strong> {getRoleLabel(user.role)}</p>
                    <p><strong>Organization:</strong> {user.organization}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Your Permissions</h3>
                  <div className="permissions-display">
                    {user.permissions && user.permissions.length > 0 ? (
                      user.permissions.map(permission => (
                        <span key={permission} className="permission-badge">
                          {getPermissionLabel(permission)}
                        </span>
                      ))
                    ) : (
                      <p>No permissions assigned</p>
                    )}
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <PermissionGate permission="read">
                      <button onClick={() => setActiveTab('projects')}>
                        View Projects
                      </button>
                    </PermissionGate>
                    
                    <PermissionGate permission="search">
                      <button onClick={handleMicModuleSearch}>
                        Search MiC Modules
                      </button>
                    </PermissionGate>
                    
                    <PermissionGate permission="data_input">
                      <button onClick={() => setActiveTab('upload')}>
                        Upload Data
                      </button>
                    </PermissionGate>
                  </div>
                </div>

                <div className="overview-card">
                  <h3>Data Statistics</h3>
                  {hasPermission('read') ? (
                    <div className="stats-display">
                      <div className="stat-item">
                        <span className="stat-number">{projects.length}</span>
                        <span className="stat-label">Total Projects</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{modules.length}</span>
                        <span className="stat-label">Module Count</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{user.permissions?.length || 0}</span>
                        <span className="stat-label">Available Permissions</span>
                      </div>
                    </div>
                  ) : (
                    <p>You don't have permission to view data statistics</p>
                  )}
                </div>

                <div className="overview-card">
                  <h3>Feature Permissions</h3>
                  <p>Based on your permissions, you can:</p>
                  <ul>
                    {hasPermission('read') && <li>View project and module data</li>}
                    {hasPermission('search') && <li>Search and filter MiC modules</li>}
                    {hasPermission('modify') && <li>Modify existing data</li>}
                    {hasPermission('comment') && <li>Add comments and annotations</li>}
                    {hasPermission('data_input') && <li>Input new data</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <PermissionGate permission="read">
              <div className="tab-content">
                <h2>Project Data</h2>
                
                {loading && <div className="loading">Loading project data...</div>}
                {error && <div className="error-message">{error}</div>}
                
                {!loading && !error && (
                  <>
                    <div className="projects-summary">
                      <p>Found {projects.length} projects</p>
                      <Link to="/projects" className="view-all-btn">
                        View All Projects
                      </Link>
                    </div>
                    
                    <div className="projects-overview">
                      <div className="overview-stats">
                        <div className="stat-card">
                          <h3>Total Projects</h3>
                          <div className="stat-number">{projects.length}</div>
                        </div>
                        <div className="stat-card">
                          <h3>In Progress</h3>
                          <div className="stat-number">
                            {projects.filter(p => p.project_status === 'In Progress').length}
                          </div>
                        </div>
                        <div className="stat-card">
                          <h3>Completed</h3>
                          <div className="stat-number">
                            {projects.filter(p => p.project_status === 'Completed').length}
                          </div>
                        </div>
                      </div>
                      
                      <div className="recent-projects">
                        <h3>Recent Projects</h3>
                        <div className="projects-list">
                          {projects.slice(0, 5).map(project => (
                            <div key={project.project_id} className="project-item">
                              <h4>{project.project_name}</h4>
                              <p>Location: {project.location}</p>
                              <p>Status: {project.project_status}</p>
                              <p>Units: {project.total_units}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </PermissionGate>
          )}

          {activeTab === 'search' && (
            <PermissionGate permission="search">
              <div className="tab-content">
                <h2>MiC Module Search</h2>
                <p>Search and filter MiC modules for reuse and analysis.</p>
                <div className="search-action-container">
                  <button 
                    className="search-modules-btn"
                    onClick={handleMicModuleSearch}
                  >
                    Go to MiC Modules Page
                  </button>
                </div>
                <div className="feature-preview">
                  <h3>Module Search Features</h3>
                  <ul>
                    <li>Filter by module type (Residential, Bathroom, Kitchen, etc.)</li>
                    <li>Search by status (Available, In Use, Maintenance)</li>
                    <li>Filter by material and manufacturer</li>
                    <li>View detailed module specifications</li>
                    <li>Access VR visualization</li>
                  </ul>
                </div>
              </div>
            </PermissionGate>
          )}

          {activeTab === 'manage' && (
            <PermissionGate permission="modify">
              <div className="tab-content">
                <h2>Data Management</h2>
                <p>Edit and update existing project and module data.</p>
                <DataManagement />
              </div>
            </PermissionGate>
          )}

          {activeTab === 'upload' && (
            <PermissionGate permission="data_input">
              <div className="tab-content">
                <h2>Data Upload</h2>
                <p>Add new project, unit and module data.</p>
                <DataUpload />
              </div>
            </PermissionGate>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Profile</h2>
              <div className="profile-section">
                <h3>Basic Information</h3>
                <div className="profile-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{user.fullName}</span>
                  </div>
                  <div className="info-row">
                    <label>Username:</label>
                    <span>{user.username}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Organization:</label>
                    <span>{user.organization}</span>
                  </div>
                  <div className="info-row">
                    <label>Role:</label>
                    <span>{getRoleLabel(user.role)}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="info-row">
                      <label>Phone:</label>
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  <div className="info-row">
                    <label>Registration Date:</label>
                    <span>{new Date(user.createdAt).toLocaleDateString('en-US')}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="info-row">
                      <label>Last Login:</label>
                      <span>{new Date(user.lastLogin).toLocaleString('en-US')}</span>
                    </div>
                  )}
                </div>
                
                <div className="profile-actions">
                  <button className="btn-secondary">Edit Profile</button>
                  <button className="btn-secondary">Change Password</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;