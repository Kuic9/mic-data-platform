import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SimpleSketchfabManager from '../components/SimpleSketchfabManager';
import './UnitDetailPage.css';

function UnitDetailPage() {
  const { unitId } = useParams();
  const { apiCall } = useAuth();
  const [unit, setUnit] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnitData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用apiCall來自動處理認證問題
      const [unitResponse, modulesResponse] = await Promise.all([
        apiCall(`/api/units/${unitId}`),
        apiCall(`/api/units/${unitId}/modules`)
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
    } catch (err) {
      console.error('Error fetching unit data:', err);
      setError('無法載入單元數據，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitData();
  }, [unitId, apiCall]);

  if (loading) {
    return <div className="loading">載入單元詳情中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={fetchUnitData} className="retry-button">
          重試
        </button>
      </div>
    );
  }

  if (!unit) {
    return <div className="error">未找到單元</div>;
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
        {/* Sketchfab 模型管理器 - 移到最上方 */}
        <div className="sketchfab-section">
          <SimpleSketchfabManager 
            projectId={unit.project_id}
            unitId={unitId}
            modules={modules}
          />
        </div>

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
        </div>

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