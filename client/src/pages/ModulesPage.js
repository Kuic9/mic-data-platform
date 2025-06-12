import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ModulesPage.css';

function ModulesPage() {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    module_type: '',
    status: '',
    material: '',
    manufacturer: ''
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/modules', {
          headers: getAuthHeaders()
        });
        
        if (response.ok) {
          const modulesData = await response.json();
          setModules(modulesData);
          setFilteredModules(modulesData);
        } else {
          // 處理HTTP錯誤
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch modules (${response.status})`);
        }
      } catch (err) {
        console.error('Error loading modules:', err);
        setError('無法載入模塊數據。請稍後再試或返回首頁。');
        // 即使出錯也設置空數組，確保UI可以渲染
        setModules([]);
        setFilteredModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [getAuthHeaders]);

  // Update filtered modules whenever filters or search query changes
  useEffect(() => {
    let result = [...modules];
    
    // Apply filters
    if (filters.module_type) {
      result = result.filter(module => module.module_type && module.module_type.includes(filters.module_type));
    }
    
    if (filters.status) {
      result = result.filter(module => module.status === filters.status);
    }
    
    if (filters.material) {
      result = result.filter(module => module.major_material === filters.material);
    }
    
    if (filters.manufacturer) {
      result = result.filter(module => module.manufacturer && module.manufacturer.includes(filters.manufacturer));
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(module => 
        (module.module_id && module.module_id.toLowerCase().includes(query)) ||
        (module.module_type && module.module_type.toLowerCase().includes(query)) ||
        (module.manufacturer && module.manufacturer.toLowerCase().includes(query)) ||
        (module.major_material && module.major_material.toLowerCase().includes(query))
      );
    }
    
    setFilteredModules(result);
  }, [filters, searchQuery, modules]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const resetFilters = () => {
    setFilters({
      module_type: '',
      status: '',
      material: '',
      manufacturer: ''
    });
    setSearchQuery('');
  };

  // 返回首頁
  const goToHome = () => {
    navigate('/');
  };

  // Extract unique values for filter dropdowns
  const moduleTypes = [...new Set(modules.filter(m => m.module_type).map(module => module.module_type))];
  const statuses = [...new Set(modules.filter(m => m.status).map(module => module.status))];
  const materials = [...new Set(modules.filter(m => m.major_material).map(module => module.major_material))];
  const manufacturers = [...new Set(modules.filter(m => m.manufacturer).map(module => module.manufacturer))];

  if (loading) {
    return <div className="loading">載入模塊中...</div>;
  }

  return (
    <div className="modules-page-container">
      <div className="page-header">
        <h1 className="page-title">MiC 模塊</h1>
        <p className="page-subtitle">瀏覽和搜索可重複使用的模塊</p>
      </div>

      {/* 錯誤信息顯示 */}
      {error && (
        <div className="error-container">
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>{error}</p>
          </div>
          <button className="btn-primary" onClick={goToHome}>返回首頁</button>
        </div>
      )}

      <div className="filters-container">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="搜索模塊..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <button className="search-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="module_type">模塊類型</label>
            <select 
              id="module_type" 
              name="module_type" 
              value={filters.module_type}
              onChange={handleFilterChange}
            >
              <option value="">所有類型</option>
              {moduleTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">狀態</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">所有狀態</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="material">材料</label>
            <select 
              id="material" 
              name="material" 
              value={filters.material}
              onChange={handleFilterChange}
            >
              <option value="">所有材料</option>
              {materials.map((material, index) => (
                <option key={index} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="manufacturer">製造商</label>
            <select 
              id="manufacturer" 
              name="manufacturer" 
              value={filters.manufacturer}
              onChange={handleFilterChange}
            >
              <option value="">所有製造商</option>
              {manufacturers.map((manufacturer, index) => (
                <option key={index} value={manufacturer}>{manufacturer}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button className="reset-filters" onClick={resetFilters}>
          重置篩選條件
        </button>
      </div>

      {filteredModules.length > 0 ? (
        <div className="modules-grid">
          {filteredModules.map(module => (
            <Link to={`/modules/${module.module_id}`} key={module.module_id} className="module-card">
              <div className="module-header">
                <h3 className="module-id">{module.module_id}</h3>
                <div className={`module-status status-pill ${module.status ? module.status.toLowerCase().replace(' ', '-') : 'unknown'}`}>
                  <span className="status-indicator">●</span>
                  {module.status || '未知'}
                </div>
              </div>
              <div className="module-content">
                <div className="module-type">{module.module_type || '未指定類型'}</div>
                <div className="module-details">
                  <div className="detail-item">
                    <span className="detail-label">材料:</span>
                    <span className="detail-value">{module.major_material || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">製造商:</span>
                    <span className="detail-value">{module.manufacturer || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">尺寸:</span>
                    <span className="detail-value">
                      {module.dimensions_length ? 
                        `${module.dimensions_length}×${module.dimensions_width}×${module.dimensions_height}m` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">品質等級:</span>
                    <span className="detail-value">{module.quality_grade ? `Grade ${module.quality_grade}` : 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="view-module-cta">
                <span>查看模塊詳情</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <p>沒有找到匹配的模塊</p>
          <button className="btn-secondary" onClick={resetFilters}>重置篩選條件</button>
        </div>
      )}
    </div>
  );
}

export default ModulesPage; 