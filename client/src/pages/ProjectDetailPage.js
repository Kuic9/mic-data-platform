import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ProjectDetailPage.css';

function ProjectDetailPage() {
  const { projectId } = useParams();
  const { getAuthHeaders } = useAuth();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch both project details and its units in parallel
        const [projectResponse, unitsResponse] = await Promise.all([
          fetch(`/api/projects/${projectId}`, {
            headers: getAuthHeaders()
          }),
          fetch(`/api/projects/${projectId}/units`, {
            headers: getAuthHeaders()
          })
        ]);
        
        if (projectResponse.ok && unitsResponse.ok) {
          const [projectData, unitsData] = await Promise.all([
            projectResponse.json(),
            unitsResponse.json()
          ]);
          
          setProject(projectData);
          setUnits(unitsData);
        } else {
          throw new Error('Failed to fetch project data');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load project data. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, getAuthHeaders]);

  if (loading) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!project) {
    return <div className="error">Project not found</div>;
  }

  return (
    <div className="project-detail-container">
      <div className="project-header">
        <div className="project-header-content">
          <h1 className="project-title">{project.project_name}</h1>
          <div className={`project-status-badge status-${project.project_status ? project.project_status.toLowerCase().replace(' ', '-') : 'unknown'}`}>
            {project.project_status || project.status || 'Unknown Status'}
          </div>
        </div>
        <Link to="/projects" className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Projects
        </Link>
      </div>
      
      <div className="project-detail-content">
        <div className="project-overview">
          <div className="project-image-container">
            <img 
              src={project.image_url} 
              alt={project.project_name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmMGYzZjciLz4KPHBhdGggZD0iTTE3NSAxMTBMMjI1IDExMEwyMjUgMTkwTDE3NSAxOTBaIiBzdHJva2U9IiNkZGQiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMTQwIDEyMEwxNzAgMTUwTDE0MCAxODAiIHN0cm9rZT0iI2RkZCIgc3Ryb2tlLXdpZHRoPSI0IiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik0yNjAgMTIwTDIzMCAxNTBMMjYwIDE4MCIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjQiIGZpbGw9Im5vbmUiLz4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIj5NaUMgUHJvamVjdDwvdGV4dD4KPC9zdmc+Cg==";
              }}
            />
          </div>
          <div className="project-info-grid">
            <div className="info-item">
              <div className="info-label">Location</div>
              <div className="info-value">{project.location}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Client</div>
              <div className="info-value">{project.client}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Contractor</div>
              <div className="info-value">{project.contractor}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Start Date</div>
              <div className="info-value">{project.start_date}</div>
            </div>
            {project.end_date && (
              <div className="info-item">
                <div className="info-label">End Date</div>
                <div className="info-value">{project.end_date}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-label">Building Height</div>
              <div className="info-value">{project.building_height}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Number of Floors</div>
              <div className="info-value">{project.num_floors}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Total Units</div>
              <div className="info-value">{project.total_units}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Total Modules</div>
              <div className="info-value">{project.total_modules}</div>
            </div>
          </div>
        </div>

        <div className="project-description-box">
          <h3 className="section-title">Project Description</h3>
          <p className="project-description-text">{project.description}</p>
        </div>

        <div className="units-section">
          <div className="section-header">
            <h2 className="section-title">Project Units</h2>
            <div className="total-count">{units.length} Units</div>
          </div>

          <div className="units-grid">
            {units.map(unit => (
              <Link to={`/units/${unit.unit_id}`} key={unit.unit_id} className="unit-card">
                <div className="unit-header">
                  <div className="unit-number">
                    <span>Floor {unit.floor_number}</span>
                    <span className="separator">•</span>
                    <span>Unit {unit.unit_number}</span>
                  </div>
                  <div className={`status-pill ${unit.status ? unit.status.toLowerCase() : 'unknown'}`}>
                    {unit.status || 'Unknown'}
                  </div>
                </div>
                <div className="unit-details">
                  <div className="unit-type">{unit.spatial_design || unit.unit_type}</div>
                  <div className="unit-specs">
                    <div className="unit-spec">
                      <span className="spec-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </span>
                      <span>{unit.area} m²</span>
                    </div>
                    <div className="unit-spec">
                      <span className="spec-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 22v-8a4 4 0 0 1 4-4h14"></path>
                          <path d="M18 22v-8a4 4 0 0 0-4-4H4"></path>
                        </svg>
                      </span>
                      <span>{unit.bedrooms} Bedrooms</span>
                    </div>
                    <div className="unit-spec">
                      <span className="spec-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                          <path d="M21 9V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path>
                        </svg>
                      </span>
                      <span>{unit.bathrooms} Bathrooms</span>
                    </div>
                  </div>
                </div>
                <div className="view-unit-cta">
                  <span>View Unit Details</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailPage; 