import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css'; // 重用HomePage的CSS样式

function ProjectsPage() {
  const { getAuthHeaders } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects', {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          throw new Error('Failed to fetch projects');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getAuthHeaders]);

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="page-title">Projects</h1>
        <p className="page-subtitle">Browse all modular integrated construction projects</p>
      </div>

      <div className="projects-grid">
        {projects.map(project => (
          <Link to={`/projects/${project.project_id}`} key={project.project_id} className="project-card">
            <div className="project-image">
              <img 
                src={project.image_url} 
                alt={project.project_name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYzZjciLz4KPHBhdGggZD0iTTEyNSA3NUwxNzUgNzVMMTc1IDEyNUwxMjUgMTI1WiIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTEwMCA4MEwxMjAgMTAwTDEwMCAxMjAiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0yMDAgODBMMTgwIDEwMEwyMDAgMTIwIiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgo8dGV4dCB4PSIxNTAiIHk9IjE3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiPk1pQyBQcm9qZWN0PC90ZXh0Pgo8L3N2Zz4K";
                }}
              />
              <div className={`project-status status-${project.project_status.toLowerCase().replace(' ', '-')}`}>
                {project.project_status}
              </div>
            </div>
            <div className="project-info">
              <h2 className="project-name">{project.project_name}</h2>
              <div className="project-details">
                <div className="project-detail">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{project.location}</span>
                </div>
                <div className="project-detail">
                  <span className="detail-label">Client:</span>
                  <span className="detail-value">{project.client}</span>
                </div>
                <div className="project-detail">
                  <span className="detail-label">Units:</span>
                  <span className="detail-value">{project.total_units}</span>
                </div>
                <div className="project-detail">
                  <span className="detail-label">Modules:</span>
                  <span className="detail-value">{project.total_modules}</span>
                </div>
              </div>
              <div className="project-description">
                {project.description.substring(0, 120)}
                {project.description.length > 120 ? '...' : ''}
              </div>
              <div className="project-dates">
                <div className="date-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{project.start_date} - {project.module_release_date || 'TBD'}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage; 