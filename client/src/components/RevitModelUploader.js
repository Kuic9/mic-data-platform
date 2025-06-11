import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './RevitModelUploader.css';

const RevitModelUploader = ({ onUploadComplete, projectId, unitId }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedModels, setUploadedModels] = useState([]);
  const [previewModel, setPreviewModel] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('model', file);
      formData.append('projectId', projectId);
      formData.append('unitId', unitId);
      formData.append('fileName', file.name);
      formData.append('fileSize', file.size);

      const response = await fetch('/api/revit/upload-model', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedModels(prev => [...prev, result.model]);
        setPreviewModel(result.model);
        if (onUploadComplete) {
          onUploadComplete(result.model);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('模型上傳失敗，請重試');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [projectId, unitId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/ifc': ['.ifc'],
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'model/fbx': ['.fbx'],
      'application/octet-stream': ['.rvt']
    },
    multiple: false,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const getSupportedFormats = () => [
    { ext: '.ifc', name: 'IFC檔案', desc: '工業基礎類別標準，建議格式' },
    { ext: '.glb', name: 'GLB檔案', desc: '3D模型二進制格式' },
    { ext: '.gltf', name: 'glTF檔案', desc: '3D模型JSON格式' },
    { ext: '.fbx', name: 'FBX檔案', desc: 'Autodesk交換格式' },
    { ext: '.rvt', name: 'Revit檔案', desc: 'Revit原生格式（需轉換）' }
  ];

  return (
    <div className="revit-uploader-container">
      <div className="uploader-header">
        <h3>上傳Revit模型</h3>
        <p>將您的Revit戶型設計上傳到平台</p>
      </div>

      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="upload-progress">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path
                  className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="circle"
                  strokeDasharray={`${uploadProgress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="progress-text">{uploadProgress}%</div>
            </div>
            <p>正在上傳模型...</p>
          </div>
        ) : (
          <div className="drop-content">
            <svg className="upload-icon" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <h4>
              {isDragActive 
                ? '放下檔案以開始上傳' 
                : '拖拽檔案到此處或點擊選擇'
              }
            </h4>
            <p>支持的格式：IFC, GLB, glTF, FBX, RVT</p>
            <p>最大檔案大小：100MB</p>
          </div>
        )}
      </div>

      <div className="supported-formats">
        <h4>支持的檔案格式</h4>
        <div className="format-list">
          {getSupportedFormats().map((format, index) => (
            <div key={index} className="format-item">
              <span className="format-ext">{format.ext}</span>
              <div className="format-info">
                <span className="format-name">{format.name}</span>
                <span className="format-desc">{format.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {uploadedModels.length > 0 && (
        <div className="uploaded-models">
          <h4>已上傳的模型</h4>
          <div className="models-list">
            {uploadedModels.map((model, index) => (
              <div key={index} className="model-item">
                <div className="model-info">
                  <h5>{model.name}</h5>
                  <p>格式: {model.format} | 大小: {(model.size / 1024 / 1024).toFixed(2)}MB</p>
                  <p>上傳時間: {new Date(model.uploadTime).toLocaleString()}</p>
                </div>
                <div className="model-actions">
                  <button 
                    className="btn-preview"
                    onClick={() => setPreviewModel(model)}
                  >
                    預覽
                  </button>
                  <button 
                    className="btn-vr"
                    onClick={() => window.open(`/vr?model=${model.id}`, '_blank')}
                  >
                    VR查看
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewModel && (
        <div className="model-preview">
          <div className="preview-header">
            <h4>模型預覽：{previewModel.name}</h4>
            <button 
              className="btn-close"
              onClick={() => setPreviewModel(null)}
            >
              ×
            </button>
          </div>
          <div className="preview-content">
            {previewModel.format === '.ifc' ? (
              <div className="ifc-viewer">
                <iframe 
                  src={`/api/revit/viewer/${previewModel.id}`}
                  title="IFC模型查看器"
                  width="100%" 
                  height="400px"
                />
              </div>
            ) : (
              <div className="model-viewer">
                <model-viewer
                  src={previewModel.url}
                  alt={previewModel.name}
                  auto-rotate
                  camera-controls
                  style={{ width: '100%', height: '400px' }}
                />
              </div>
            )}
          </div>
          <div className="model-details">
            <h5>模型信息</h5>
            <div className="details-grid">
              <div className="detail-item">
                <label>檔案名稱:</label>
                <span>{previewModel.name}</span>
              </div>
              <div className="detail-item">
                <label>檔案格式:</label>
                <span>{previewModel.format}</span>
              </div>
              <div className="detail-item">
                <label>檔案大小:</label>
                <span>{(previewModel.size / 1024 / 1024).toFixed(2)}MB</span>
              </div>
              <div className="detail-item">
                <label>上傳時間:</label>
                <span>{new Date(previewModel.uploadTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevitModelUploader; 