import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SimpleSketchfabManager from '../components/SimpleSketchfabManager';
import './ModuleDetailPage.css';

function ModuleDetailPage() {
  const { moduleId } = useParams();
  const { apiCall } = useAuth();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchModuleData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 使用apiCall來自動處理認證問題
      const response = await apiCall(`/api/modules/${moduleId}`);
      
      if (response.ok) {
        const moduleData = await response.json();
        setModule(moduleData);
      } else {
        throw new Error('Failed to fetch module data');
      }
    } catch (err) {
      console.error('Error fetching module data:', err);
      setError('無法載入模塊數據，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleData();
  }, [moduleId, apiCall]);

  // 獲取狀態對應的說明文字
  const getStatusDescription = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return '模塊處於活躍狀態，可以正常使用。';
      case 'in use':
        return '模塊目前正在使用中。';
      case 'maintenance':
        return '模塊正在進行維護或修理。';
      case 'decommissioned':
        return '模塊已停止使用，不再服務。';
      default:
        return '模塊狀態未知。';
    }
  };

  if (loading) {
    return <div className="loading">載入模塊詳情中...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button onClick={fetchModuleData} className="retry-button">
          重試
        </button>
      </div>
    );
  }

  if (!module) {
    return <div className="error">未找到模塊</div>;
  }

  // 將模塊狀態轉換為CSS類名
  const statusClass = module.status ? module.status.toLowerCase().replace(/\s+/g, '-') : 'unknown';

  return (
    <div className="module-detail-container">
      <div className="module-header">
        <div className="module-header-content">
          <h1 className="module-title">{module.module_id}</h1>
          <div className={`module-status-badge status-${statusClass}`}>
            {module.status || '未知狀態'}
          </div>
        </div>
        <div className="header-actions">
          <Link to={`/units/${module.unit_id}`} className="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            返回單元
          </Link>
        </div>
      </div>
      
      <div className="module-detail-content">
        {/* 顯示3D模型 */}
        <div className="module-3d-section">
          <SimpleSketchfabManager 
            moduleId={module.module_id}
          />
        </div>

        {/* 模塊信息卡片 */}
        <div className="module-info-card">
          <div className="info-card-header">
            <h2 className="info-card-title">模塊信息</h2>
            <div className={`status-indicator status-${statusClass}`}>
              <span className="status-dot"></span>
              <span className="status-text">{module.status || '未知狀態'}</span>
            </div>
          </div>
          
          <div className="info-grid">
            {/* 基本信息和物理特性合併在一起 */}
            <div className="info-columns">
              <div className="info-column">
                <h3 className="column-title">基本信息</h3>
                <div className="info-row">
                  <div className="info-label">模塊類型</div>
                  <div className="info-value">{module.module_type || 'N/A'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">製造商</div>
                  <div className="info-value">{module.manufacturer || 'N/A'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">材料</div>
                  <div className="info-value">{module.major_material || 'N/A'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">用途</div>
                  <div className="info-value">{module.intended_use || 'N/A'}</div>
                </div>
              </div>
              
              <div className="info-column">
                <h3 className="column-title">物理特性</h3>
                <div className="info-row">
                  <div className="info-label">尺寸</div>
                  <div className="info-value">
                    {module.dimensions_length && module.dimensions_width && module.dimensions_height ? 
                      `${module.dimensions_length}×${module.dimensions_width}×${module.dimensions_height}m` : 
                      'N/A'
                    }
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">重量</div>
                  <div className="info-value">{module.weight ? `${module.weight} 噸` : 'N/A'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">品質等級</div>
                  <div className="info-value">{module.quality_grade ? `Grade ${module.quality_grade}` : 'N/A'}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">認證</div>
                  <div className="info-value">{module.certification || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 狀態和安裝信息 */}
        <div className="status-installation-row">
          <div className="detail-card installation-card">
            <h3 className="card-title">安裝信息</h3>
            <div className="info-row">
              <div className="info-label">安裝日期</div>
              <div className="info-value">{module.installation_date || 'N/A'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">單元</div>
              <div className="info-value">{module.unit_id || 'N/A'}</div>
            </div>
          </div>
          
          <div className="detail-card status-card">
            <h3 className="card-title">狀態信息</h3>
            <div className={`status-highlight status-${statusClass}`}>
              <div className="status-icon">●</div>
              <div className="status-content">
                <div className="status-name">{module.status || '未知狀態'}</div>
                <div className="status-desc">{getStatusDescription(module.status)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 模塊屬性 */}
        {module.attributes && module.attributes.length > 0 && (
          <div className="module-attributes-card">
            <h3 className="card-title">模塊屬性</h3>
            <div className="attributes-list">
              {module.attributes.map((attr) => (
                <div key={attr.id} className="attribute-item">
                  <div className="attribute-name">{attr.attribute_name}</div>
                  <div className="attribute-value">{attr.attribute_value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 模塊時間線 */}
        <div className="module-timeline-card">
          <h3 className="card-title">模塊歷程</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="timeline-date">製造</div>
                <div className="timeline-title">已創建</div>
                <div className="timeline-desc">由 {module.manufacturer || '未知製造商'} 製造</div>
              </div>
            </div>
            
            {module.installation_date && (
              <div className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{module.installation_date}</div>
                  <div className="timeline-title">安裝</div>
                  <div className="timeline-desc">安裝於單元 {module.unit_id}</div>
                </div>
              </div>
            )}
            
            <div className={`timeline-item current-status timeline-status-${statusClass}`}>
              <div className="timeline-marker current"></div>
              <div className="timeline-content">
                <div className="timeline-date">目前</div>
                <div className="timeline-title">
                  <span className="status-dot"></span>
                  {module.status || '未知狀態'}
                </div>
                <div className="timeline-desc">{getStatusDescription(module.status)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleDetailPage; 