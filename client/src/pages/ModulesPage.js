import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ModuleService } from '../services/api';
import './ModulesPage.css';

function ModulesPage() {
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
        const modulesData = await ModuleService.getModules();
        setModules(modulesData);
        setFilteredModules(modulesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load modules. Please try again later.');
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Update filtered modules whenever filters or search query changes
  useEffect(() => {
    let result = [...modules];
    
    // Apply filters
    if (filters.module_type) {
      result = result.filter(module => module.module_type.includes(filters.module_type));
    }
    
    if (filters.status) {
      result = result.filter(module => module.status === filters.status);
    }
    
    if (filters.material) {
      result = result.filter(module => module.major_material === filters.material);
    }
    
    if (filters.manufacturer) {
      result = result.filter(module => module.manufacturer.includes(filters.manufacturer));
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(module => 
        module.module_id.toLowerCase().includes(query) ||
        module.module_type.toLowerCase().includes(query) ||
        module.manufacturer.toLowerCase().includes(query) ||
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

  // Extract unique values for filter dropdowns
  const moduleTypes = [...new Set(modules.map(module => module.module_type).filter(Boolean))];
  const statuses = [...new Set(modules.map(module => module.status).filter(Boolean))];
  const materials = [...new Set(modules.map(module => module.major_material).filter(Boolean))];
  const manufacturers = [...new Set(modules.map(module => module.manufacturer).filter(Boolean))];

  if (loading) {
    return <div className="loading">Loading modules...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="modules-page-container">
      <div className="page-header">
        <h1 className="page-title">MiC Modules</h1>
        <p className="page-subtitle">Browse and search available modules for reuse</p>
      </div>

      <div className="filters-container">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search modules..." 
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
            <label htmlFor="module_type">Module Type</label>
            <select 
              id="module_type" 
              name="module_type" 
              value={filters.module_type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {moduleTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select 
              id="status" 
              name="status" 
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              {statuses.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="material">Material</label>
            <select 
              id="material" 
              name="material" 
              value={filters.material}
              onChange={handleFilterChange}
            >
              <option value="">All Materials</option>
              {materials.map((material, index) => (
                <option key={index} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="manufacturer">Manufacturer</label>
            <select 
              id="manufacturer" 
              name="manufacturer" 
              value={filters.manufacturer}
              onChange={handleFilterChange}
            >
              <option value="">All Manufacturers</option>
              {manufacturers.map((manufacturer, index) => (
                <option key={index} value={manufacturer}>{manufacturer}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn-reset" onClick={resetFilters}>Reset Filters</button>
        </div>
      </div>

      <div className="results-header">
        <div className="results-count">{filteredModules.length} modules found</div>
      </div>

      <div className="modules-grid">
        {filteredModules.map(module => (
          <Link to={`/modules/${module.module_id}`} key={module.module_id} className="module-card">
            <div className="module-header">
              <h3 className="module-id">{module.module_id}</h3>
              <div className={`module-status status-pill ${module.status.toLowerCase().replace(' ', '-')}`}>
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
                  <span className="detail-label">Quality Grade:</span>
                  <span className="detail-value">{module.quality_grade ? `Grade ${module.quality_grade}` : 'N/A'}</span>
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
      
      {filteredModules.length === 0 && (
        <div className="no-results">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <p>No modules match your search criteria</p>
          <button className="btn-reset" onClick={resetFilters}>Clear Filters</button>
        </div>
      )}
    </div>
  );
}

export default ModulesPage; 