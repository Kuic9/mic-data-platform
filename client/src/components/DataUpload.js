import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './DataUpload.css';

const DataUpload = () => {
  const { hasPermission, getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('project');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadFile, setUploadFile] = useState(null);

  // 重置表单
  const resetForm = () => {
    setFormData({});
    setUploadFile(null);
    setError('');
    setSuccess('');
  };

  // 处理表单输入
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // 处理文件上传
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadFile(file);
  };

  // 生成唯一ID
  const generateId = (prefix) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}_${timestamp}_${random}`;
  };

  // 提交项目数据
  const submitProject = async () => {
    if (!formData.project_name || !formData.location) {
      setError('Project name and location are required');
      return;
    }

    const projectData = {
      project_id: generateId('PRJ'),
      project_name: formData.project_name,
      location: formData.location,
      total_units: formData.total_units || 0,
      start_date: formData.start_date || null,
      module_release_date: formData.module_release_date || null,
      module_life_span: formData.module_life_span || null,
      client: formData.client || '',
      primary_structural_material: formData.primary_structural_material || '',
      contractor: formData.contractor || '',
      manufacturer: formData.manufacturer || '',
      operator: formData.operator || '',
      site_location: formData.site_location || '',
      building_height: formData.building_height || null,
      num_floors: formData.num_floors || null,
      unit_types: formData.unit_types || '',
      total_modules: formData.total_modules || null,
      structural_system: formData.structural_system || '',
      other_actors: formData.other_actors || '',
      ap_rec_rc: formData.ap_rec_rc || '',
      project_status: formData.project_status || 'Planning',
      description: formData.description || '',
      image_url: formData.image_url || ''
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        setSuccess('Project created successfully');
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create project');
      }
    } catch (err) {
      setError('Network error while creating project');
    }
  };

  // 提交单元数据
  const submitUnit = async () => {
    if (!formData.unit_id || !formData.project_id) {
      setError('Unit ID and Project ID are required');
      return;
    }

    const unitData = {
      unit_id: formData.unit_id,
      project_id: formData.project_id,
      unit_type: formData.unit_type || '',
      floor_level: formData.floor_level || null,
      position: formData.position || '',
      area: formData.area || null,
      num_modules: formData.num_modules || null,
      completion_date: formData.completion_date || null,
      status: formData.status || 'Planning'
    };

    try {
      const response = await fetch('/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(unitData)
      });

      if (response.ok) {
        setSuccess('Unit created successfully');
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create unit');
      }
    } catch (err) {
      setError('Network error while creating unit');
    }
  };

  // 提交模块数据
  const submitModule = async () => {
    if (!formData.module_id || !formData.unit_id) {
      setError('Module ID and Unit ID are required');
      return;
    }

    const moduleData = {
      module_id: formData.module_id,
      unit_id: formData.unit_id,
      module_type: formData.module_type || '',
      manufacturer: formData.manufacturer || '',
      major_material: formData.major_material || '',
      intended_use: formData.intended_use || '',
      status: formData.status || 'Available',
      dimensions_length: formData.dimensions_length || null,
      dimensions_width: formData.dimensions_width || null,
      dimensions_height: formData.dimensions_height || null,
      weight: formData.weight || null,
      installation_date: formData.installation_date || null,
      quality_grade: formData.quality_grade || '',
      certification: formData.certification || ''
    };

    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(moduleData)
      });

      if (response.ok) {
        setSuccess('Module created successfully');
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create module');
      }
    } catch (err) {
      setError('Network error while creating module');
    }
  };

  // 批量上传文件
  const submitBulkUpload = async () => {
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('file', uploadFile);
    formDataObj.append('type', activeTab);

    try {
      const response = await fetch('/api/upload/bulk', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formDataObj
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`Bulk upload completed: ${result.created} records created`);
        setUploadFile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('Network error while uploading file');
    }
  };

  // 下载模板文件
  const downloadTemplate = async (type) => {
    try {
      const response = await fetch(`/api/upload/template/${type}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${type}-template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess(`${type} template downloaded successfully`);
      } else {
        setError('Template download failed');
      }
    } catch (err) {
      setError('Template download failed: ' + err.message);
    }
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'project') {
        await submitProject();
      } else if (activeTab === 'unit') {
        await submitUnit();
      } else if (activeTab === 'module') {
        await submitModule();
      } else if (activeTab === 'bulk') {
        await submitBulkUpload();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission('data_input')) {
    return (
      <div className="no-permission">
        <p>You don't have permission to upload data.</p>
      </div>
    );
  }

  return (
    <div className="data-upload">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="upload-tabs">
        <button 
          className={activeTab === 'project' ? 'active' : ''}
          onClick={() => setActiveTab('project')}
        >
          Add Project
        </button>
        <button 
          className={activeTab === 'unit' ? 'active' : ''}
          onClick={() => setActiveTab('unit')}
        >
          Add Unit
        </button>
        <button 
          className={activeTab === 'module' ? 'active' : ''}
          onClick={() => setActiveTab('module')}
        >
          Add Module
        </button>
        <button 
          className={activeTab === 'bulk' ? 'active' : ''}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Upload
        </button>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        {activeTab === 'project' && (
          <div className="form-section">
            <h3>Add New Project</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Project Name *:</label>
                <input
                  type="text"
                  name="project_name"
                  value={formData.project_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location *:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  required
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
                <label>Start Date:</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Project Status:</label>
                <select
                  name="project_status"
                  value={formData.project_status || 'Planning'}
                  onChange={handleInputChange}
                >
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
          </div>
        )}

        {activeTab === 'unit' && (
          <div className="form-section">
            <h3>Add New Unit</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Unit ID *:</label>
                <input
                  type="text"
                  name="unit_id"
                  value={formData.unit_id || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project ID *:</label>
                <input
                  type="text"
                  name="project_id"
                  value={formData.project_id || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit Type:</label>
                <select
                  name="unit_type"
                  value={formData.unit_type || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Select Type</option>
                  <option value="Studio">Studio</option>
                  <option value="1-Bedroom">1-Bedroom</option>
                  <option value="2-Bedroom">2-Bedroom</option>
                  <option value="3-Bedroom">3-Bedroom</option>
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
                />
              </div>
              <div className="form-group">
                <label>Area (sqm):</label>
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
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status || 'Planning'}
                  onChange={handleInputChange}
                >
                  <option value="Planning">Planning</option>
                  <option value="Under Construction">Under Construction</option>
                  <option value="Completed">Completed</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'module' && (
          <div className="form-section">
            <h3>Add New Module</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Module ID *:</label>
                <input
                  type="text"
                  name="module_id"
                  value={formData.module_id || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit ID *:</label>
                <input
                  type="text"
                  name="unit_id"
                  value={formData.unit_id || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status || 'Available'}
                  onChange={handleInputChange}
                >
                  <option value="Available">Available</option>
                  <option value="In Use">In Use</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
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
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="form-section">
            <h3>Bulk Upload</h3>
            <div className="bulk-upload-section">
              <div className="upload-info">
                <p>Upload CSV or Excel files to add multiple records at once.</p>
                <ul>
                  <li>Supported formats: .csv, .xlsx, .xls</li>
                  <li>Maximum file size: 10MB</li>
                  <li>Ensure your file follows the template format</li>
                </ul>
              </div>
              <div className="file-upload">
                <label>Select File:</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
                {uploadFile && (
                  <div className="file-info">
                    <p>Selected: {uploadFile.name}</p>
                    <p>Size: {(uploadFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}
              </div>
              <div className="template-downloads">
                <h4>Download Templates:</h4>
                <button type="button" onClick={() => downloadTemplate('projects')} className="template-btn">
                  Download Project Template
                </button>
                <button type="button" onClick={() => downloadTemplate('units')} className="template-btn">
                  Download Unit Template
                </button>
                <button type="button" onClick={() => downloadTemplate('modules')} className="template-btn">
                  Download Module Template
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Uploading...' : (activeTab === 'bulk' ? 'Upload File' : 'Create Record')}
          </button>
          <button type="button" onClick={resetForm} className="btn-secondary">
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataUpload; 