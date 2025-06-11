import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './DataManagement.css';

const DataManagement = () => {
  const { hasPermission, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [modules, setModules] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 获取项目数据
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (err) {
      setError('Network error while fetching projects');
    }
  };

  // 获取单元数据
  const fetchUnits = async () => {
    try {
      const response = await fetch('/api/units', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUnits(data);
      } else {
        setError('Failed to fetch units');
      }
    } catch (err) {
      setError('Network error while fetching units');
    }
  };

  // 获取模块数据
  const fetchModules = async () => {
    try {
      const response = await fetch('/api/modules', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      } else {
        setError('Failed to fetch modules');
      }
    } catch (err) {
      setError('Network error while fetching modules');
    }
  };

  useEffect(() => {
    if (hasPermission('modify')) {
      fetchProjects();
      fetchUnits();
      fetchModules();
    }
  }, [hasPermission]);

  // 开始编辑
  const startEdit = (item, type) => {
    setEditingItem({ ...item, type });
    setFormData({ ...item });
    setError('');
    setSuccess('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingItem(null);
    setFormData({});
    setError('');
    setSuccess('');
  };

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 保存编辑
  const saveEdit = async () => {
    if (!editingItem) return;

    setLoading(true);
    setError('');
    
    try {
      let endpoint;
      if (editingItem.type === 'project') {
        endpoint = `/api/projects/${editingItem.project_id}`;
      } else if (editingItem.type === 'unit') {
        endpoint = `/api/units/${editingItem.unit_id}`;
      } else {
        endpoint = `/api/modules/${editingItem.module_id}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Data updated successfully');
        setEditingItem(null);
        setFormData({});
        
        // 刷新数据
        if (editingItem.type === 'project') {
          fetchProjects();
        } else if (editingItem.type === 'unit') {
          fetchUnits();
        } else {
          fetchModules();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update data');
      }
    } catch (err) {
      setError('Network error while saving data');
    } finally {
      setLoading(false);
    }
  };

  // 删除项目/模块
  const deleteItem = async (item, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let endpoint;
      if (type === 'project') {
        endpoint = `/api/projects/${item.project_id}`;
      } else if (type === 'unit') {
        endpoint = `/api/units/${item.unit_id}`;
      } else {
        endpoint = `/api/modules/${item.module_id}`;
      }
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        setSuccess(`${type} deleted successfully`);
        
        // 刷新数据
        if (type === 'project') {
          fetchProjects();
        } else if (type === 'unit') {
          fetchUnits();
        } else {
          fetchModules();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Failed to delete ${type}`);
      }
    } catch (err) {
      setError(`Network error while deleting ${type}`);
    } finally {
      setLoading(false);
    }
  };

  // 渲染编辑表单
  const renderEditForm = () => {
    if (!editingItem) return null;

    if (editingItem.type === 'project') {
      return (
        <div className="edit-form">
          <h3>Edit Project: {editingItem.project_name}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Project Name:</label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Total Units:</label>
              <input
                type="number"
                name="total_units"
                value={formData.total_units || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Project Status:</label>
              <select
                name="project_status"
                value={formData.project_status || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="form-group">
              <label>Client:</label>
              <input
                type="text"
                name="client"
                value={formData.client || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Contractor:</label>
              <input
                type="text"
                name="contractor"
                value={formData.contractor || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Manufacturer:</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Building Height (m):</label>
              <input
                type="number"
                step="0.1"
                name="building_height"
                value={formData.building_height || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Number of Floors:</label>
              <input
                type="number"
                name="num_floors"
                value={formData.num_floors || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group full-width">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={saveEdit} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      );
    } else if (editingItem.type === 'unit') {
      return (
        <div className="edit-form">
          <h3>Edit Unit: {editingItem.unit_id}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit Type:</label>
              <select
                name="unit_type"
                value={formData.unit_type || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Type</option>
                <option value="1BR">1 Bedroom</option>
                <option value="2BR">2 Bedroom</option>
                <option value="3BR">3 Bedroom</option>
                <option value="Studio">Studio</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div className="form-group">
              <label>Floor Level:</label>
              <input
                type="number"
                name="floor_level"
                value={formData.floor_level || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Position:</label>
              <input
                type="text"
                name="position"
                value={formData.position || ''}
                onChange={handleInputChange}
                placeholder="e.g., North-East, Corner"
              />
            </div>
            <div className="form-group">
              <label>Area (m²):</label>
              <input
                type="number"
                step="0.1"
                name="area"
                value={formData.area || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Number of Modules:</label>
              <input
                type="number"
                name="num_modules"
                value={formData.num_modules || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Completion Date:</label>
              <input
                type="date"
                name="completion_date"
                value={formData.completion_date ? formData.completion_date.split('T')[0] : ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="Planning">Planning</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Completed">Completed</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button onClick={saveEdit} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      );
    } else if (editingItem.type === 'module') {
      return (
        <div className="edit-form">
          <h3>Edit Module: {editingItem.module_id}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Module Type:</label>
              <select
                name="module_type"
                value={formData.module_type || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Type</option>
                <option value="Residential">Residential</option>
                <option value="Bathroom">Bathroom</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Living Room">Living Room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Structural">Structural</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Decommissioned">Decommissioned</option>
              </select>
            </div>
            <div className="form-group">
              <label>Manufacturer:</label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Major Material:</label>
              <input
                type="text"
                name="major_material"
                value={formData.major_material || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Intended Use:</label>
              <input
                type="text"
                name="intended_use"
                value={formData.intended_use || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Quality Grade:</label>
              <select
                name="quality_grade"
                value={formData.quality_grade || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Grade</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <div className="form-group">
              <label>Length (mm):</label>
              <input
                type="number"
                name="dimensions_length"
                value={formData.dimensions_length || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Width (mm):</label>
              <input
                type="number"
                name="dimensions_width"
                value={formData.dimensions_width || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Height (mm):</label>
              <input
                type="number"
                name="dimensions_height"
                value={formData.dimensions_height || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Weight (kg):</label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={saveEdit} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancelEdit} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      );
    }
  };

  if (!hasPermission('modify')) {
    return (
      <div className="no-permission">
        <p>You don't have permission to manage data.</p>
      </div>
    );
  }

  return (
    <div className="data-management">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="management-tabs">
        <button 
          className={activeTab === 'projects' ? 'active' : ''}
          onClick={() => setActiveTab('projects')}
        >
          Manage Projects
        </button>
        <button 
          className={activeTab === 'units' ? 'active' : ''}
          onClick={() => setActiveTab('units')}
        >
          Manage Units
        </button>
        <button 
          className={activeTab === 'modules' ? 'active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          Manage Modules
        </button>
      </div>

      {editingItem && renderEditForm()}

      {activeTab === 'projects' && (
        <div className="data-section">
          <h3>Projects ({projects.length})</h3>
          <div className="data-grid">
            {projects.map(project => (
              <div key={project.project_id} className="data-item">
                <div className="item-header">
                  <h4>{project.project_name}</h4>
                  <div className="item-actions">
                    <button 
                      onClick={() => startEdit(project, 'project')}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteItem(project, 'project')}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <p><strong>Location:</strong> {project.location}</p>
                  <p><strong>Units:</strong> {project.total_units}</p>
                  <p><strong>Status:</strong> {project.project_status}</p>
                  <p><strong>Client:</strong> {project.client}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'units' && (
        <div className="data-section">
          <h3>Units ({units.length})</h3>
          <div className="data-grid">
            {units.map(unit => (
              <div key={unit.unit_id} className="data-item">
                <div className="item-header">
                  <h4>{unit.unit_id}</h4>
                  <div className="item-actions">
                    <button 
                      onClick={() => startEdit(unit, 'unit')}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteItem(unit, 'unit')}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <p><strong>Project:</strong> {unit.project_id}</p>
                  <p><strong>Type:</strong> {unit.unit_type}</p>
                  <p><strong>Floor:</strong> {unit.floor_level}</p>
                  <p><strong>Area:</strong> {unit.area} m²</p>
                  <p><strong>Status:</strong> {unit.status}</p>
                  <p><strong>Position:</strong> {unit.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="data-section">
          <h3>Modules ({modules.length})</h3>
          <div className="data-grid">
            {modules.map(module => (
              <div key={module.module_id} className="data-item">
                <div className="item-header">
                  <h4>{module.module_id}</h4>
                  <div className="item-actions">
                    <button 
                      onClick={() => startEdit(module, 'module')}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteItem(module, 'module')}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="item-details">
                  <p><strong>Type:</strong> {module.module_type}</p>
                  <p><strong>Status:</strong> {module.status}</p>
                  <p><strong>Manufacturer:</strong> {module.manufacturer}</p>
                  <p><strong>Material:</strong> {module.major_material}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement; 