import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RevitModelUploader from '../components/RevitModelUploader';
import './UnitDetailPage.css';

function UnitDetailPage() {
  const { unitId } = useParams();
  const { getAuthHeaders } = useAuth();
  const [unit, setUnit] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModelUploader, setShowModelUploader] = useState(false);
  const [unitModels, setUnitModels] = useState([]);

  useEffect(() => {
    const fetchUnitData = async () => {
      try {
        // Fetch both unit details and its modules in parallel
        const [unitResponse, modulesResponse] = await Promise.all([
          fetch(`/api/units/${unitId}`, {
            headers: getAuthHeaders()
          }),
          fetch(`/api/units/${unitId}/modules`, {
            headers: getAuthHeaders()
          })
        ]);
        
        if (unitResponse.ok && modulesResponse.ok) {
          const [unitData, modulesData] = await Promise.all([
            unitResponse.json(),
            modulesResponse.json()
          ]);
          
          setUnit(unitData);
          setModules(modulesData);
        } else {
          throw new Error('Failed to fetch unit data');
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load unit data. Please try again later.');
        setLoading(false);
      }
    };

    fetchUnitData();
    fetchUnitModels();
  }, [unitId, getAuthHeaders]);

  const fetchUnitModels = async () => {
    try {
      const response = await fetch(`/api/units/${unitId}/models`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const modelsData = await response.json();
        setUnitModels(modelsData);
      }
    } catch (err) {
      console.error('Failed to fetch unit models:', err);
    }
  };

  const handleModelUploadComplete = (newModel) => {
    setUnitModels(prev => [...prev, newModel]);
    setShowModelUploader(false);
  };

  if (loading) {
    return <div className="loading">Loading unit details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!unit) {
    return <div className="error">Unit not found</div>;
  }

  return (
    <div className="unit-detail-container">
      <div className="unit-header">
        <div className="unit-header-content">
          <h1 className="unit-title">
            <span>Unit {unit.unit_number}</span>
            <span className="unit-floor">Floor {unit.floor_number}</span>
          </h1>
          <div className={`unit-status-badge status-pill ${unit.status.toLowerCase()}`}>
            {unit.status}
          </div>
        </div>
        <Link to={`/projects/${unit.project_id}`} className="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Project
        </Link>
      </div>
      
      <div className="unit-detail-content">
        <div className="unit-overview">
          <div className="unit-info-section">
            <h2 className="section-title">Unit Information</h2>
            <div className="unit-info-grid">
              <div className="info-item">
                <div className="info-label">Unit Type</div>
                <div className="info-value">{unit.spatial_design || unit.unit_type}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Area</div>
                <div className="info-value">{unit.area} m²</div>
              </div>
              <div className="info-item">
                <div className="info-label">Bedrooms</div>
                <div className="info-value">{unit.bedrooms}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Bathrooms</div>
                <div className="info-value">{unit.bathrooms}</div>
              </div>
              <div className="info-item">
                <div className="info-label">Status</div>
                <div className="info-value">{unit.status}</div>
              </div>
            </div>
          </div>
          
          <div className="unit-schematic">
            <div className="schematic-header">
              <h3 className="schematic-title">Unit 3D Model & Schematic</h3>
              <button 
                className="btn-upload-model"
                onClick={() => setShowModelUploader(!showModelUploader)}
              >
                {showModelUploader ? 'Close Uploader' : 'Upload 3D Model'}
              </button>
            </div>
            
            {unitModels.length > 0 ? (
              <div className="unit-models-display">
                {unitModels.map((model, index) => (
                  <div key={index} className="model-display-item">
                    <div className="model-preview-small">
                      {model.format === '.ifc' ? (
                        <iframe 
                          src={`/api/revit/viewer/${model.id}`}
                          title="Unit Model Viewer"
                          width="100%" 
                          height="200px"
                        />
                      ) : (
                        <model-viewer
                          src={model.url}
                          alt={model.name}
                          auto-rotate
                          camera-controls
                          style={{ width: '100%', height: '200px' }}
                        />
                      )}
                    </div>
                    <div className="model-info-small">
                      <h4>{model.name}</h4>
                      <p>格式: {model.format}</p>
                      <div className="model-actions-small">
                        <button 
                          className="btn-view-full"
                          onClick={() => window.open(`/vr?model=${model.id}`, '_blank')}
                        >
                          Full View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="schematic-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                  <path d="M3 9h18"></path>
                  <path d="M9 21V9"></path>
                </svg>
                <span>Upload your Revit model to display here</span>
              </div>
            )}
          </div>
        </div>

        {showModelUploader && (
          <div className="model-uploader-section">
            <RevitModelUploader 
              projectId={unit.project_id}
              unitId={unitId}
              onUploadComplete={handleModelUploadComplete}
            />
          </div>
        )}

        <div className="modules-section">
          <div className="section-header">
            <h2 className="section-title">Unit Modules</h2>
            <div className="total-count">{modules.length} modules</div>
          </div>

          <div className="modules-grid">
            {modules.map(module => (
              <Link to={`/modules/${module.module_id}`} key={module.module_id} className="module-card">
                <div className="module-header">
                  <h3 className="module-id">{module.module_id}</h3>
                  <div className={`module-status status-pill ${module.status.toLowerCase().replace(' ', '-')}`}>
                    <span className="status-indicator">●</span>
                    {module.status}
                  </div>
                </div>
                <div className="module-content">
                  <div className="module-type">{module.module_type}</div>
                  <div className="module-details">
                    <div className="detail-item">
                      <span className="detail-label">Material:</span>
                      <span className="detail-value">{module.major_material || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Manufacturer:</span>
                      <span className="detail-value">{module.manufacturer || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Dimensions:</span>
                      <span className="detail-value">
                        {module.dimensions ? 
                          `${module.dimensions.length}×${module.dimensions.width}×${module.dimensions.height}m` : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Weight:</span>
                      <span className="detail-value">{module.weight ? `${module.weight} tonnes` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="module-dates">
                    <div className="date-item">
                      <span className="date-label">Quality Grade:</span>
                      <span className="date-value">{module.quality_grade || 'N/A'}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Installed:</span>
                      <span className="date-value">{module.installation_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="view-module-cta">
                  <span>View Module Details</span>
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

export default UnitDetailPage; 