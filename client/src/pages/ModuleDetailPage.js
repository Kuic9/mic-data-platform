import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ModuleService } from '../services/api';
import './ModuleDetailPage.css';

function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        const moduleData = await ModuleService.getModule(moduleId);
        setModule(moduleData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load module data. Please try again later.');
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [moduleId]);

  const handleVRView = () => {
    // Navigate to VR page and pass module information as state
    navigate('/vr', { 
      state: { 
        selectedModule: module,
        fromModuleDetail: true 
      } 
    });
  };

  if (loading) {
    return <div className="loading">Loading module details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!module) {
    return <div className="error">Module not found</div>;
  }

  return (
    <div className="module-detail-container">
      <div className="module-header">
        <div className="module-header-content">
          <h1 className="module-title">{module.module_id}</h1>
          <div className={`module-status-badge status-${module.status.toLowerCase().replace(' ', '-')}`}>
            {module.status}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="vr-view-button"
            onClick={handleVRView}
            title="In VR view this module"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="5" width="22" height="14" rx="7"/>
              <path d="m8 12 4-4 4 4"/>
            </svg>
            VR View
          </button>
          <Link to={`/units/${module.unit_id}`} className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Unit
          </Link>
        </div>
      </div>
      
      <div className="module-detail-content">
        <div className="module-overview">
          <div className="module-visualization">
            <h3 className="visualization-title">Module Visualization</h3>
            <div className="visualization-placeholder" onClick={handleVRView} style={{ cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Click to enter VR view</span>
            </div>
          </div>
          
          <div className="module-info-grid">
            <div className="info-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="info-items">
                <div className="info-item">
                  <div className="info-label">Module Type</div>
                  <div className="info-value">{module.module_type}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Manufacturer</div>
                  <div className="info-value">{module.manufacturer}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Material</div>
                  <div className="info-value">{module.major_material || 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Intended Use</div>
                  <div className="info-value">{module.intended_use || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="info-section">
              <h3 className="section-title">Physical Properties</h3>
              <div className="info-items">
                <div className="info-item">
                  <div className="info-label">Dimensions</div>
                  <div className="info-value">
                    {module.dimensions ? 
                      `${module.dimensions.length}×${module.dimensions.width}×${module.dimensions.height}m` : 
                      'N/A'
                    }
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Weight</div>
                  <div className="info-value">{module.weight ? `${module.weight} tonnes` : 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Quality Grade</div>
                  <div className="info-value">{module.quality_grade ? `Grade ${module.quality_grade}` : 'N/A'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Certification</div>
                  <div className="info-value">{module.certification || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="module-details-section">
          <div className="details-row">
            <div className="detail-box">
              <h3 className="section-title">Installation Information</h3>
              <p className="specifications-text">
                Installation Date: {module.installation_date || 'N/A'}
              </p>
            </div>
            
            <div className="detail-box">
              <h3 className="section-title">Module Status</h3>
              <p className="maintenance-text">
                Current Status: {module.status}<br/>
                Unit ID: {module.unit_id}
              </p>
            </div>
          </div>
        </div>

        <div className="module-attributes-section">
          <h3 className="section-title">Module Attributes</h3>
          <div className="attributes-list">
            {module.attributes && module.attributes.length > 0 ? (
              module.attributes.map((attr) => (
                <div key={attr.id} className="attribute-item">
                  <div className="attribute-name">{attr.attribute_name}</div>
                  <div className="attribute-value">{attr.attribute_value}</div>
                </div>
              ))
            ) : (
              <div className="no-attributes">
                <p>No attributes available for this module.</p>
              </div>
            )}
          </div>
        </div>

        <div className="timeline-section">
          <h3 className="section-title">Module Timeline</h3>
          <div className="timeline-track">
            <div className="timeline-item">
              <div className="timeline-date">Manufacturing</div>
              <div className="timeline-event">Created</div>
              <div className="timeline-desc">Manufactured by {module.manufacturer}</div>
            </div>
            
            {module.installation_date && (
              <div className="timeline-item">
                <div className="timeline-date">{module.installation_date}</div>
                <div className="timeline-event">Installation</div>
                <div className="timeline-desc">Installed in Unit {module.unit_id}</div>
              </div>
            )}
            
            <div className="timeline-item">
              <div className="timeline-date">Current</div>
              <div className="timeline-event">{module.status}</div>
              <div className="timeline-desc">
                {module.status === 'In Use' && 'Module is currently in use'}
                {module.status === 'Available' && 'Module is available for reuse'}
                {module.status === 'Maintenance' && 'Module is under maintenance'}
                {module.status === 'Decommissioned' && 'Module has been decommissioned'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleDetailPage; 