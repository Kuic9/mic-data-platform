import React, { useState, useEffect, useCallback } from 'react';
import './SketchfabEmbedManager.css';

const SketchfabEmbedManager = ({ projectId, unitId, onModelAdded }) => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    iframeCode: '',
    modelName: '',
    description: ''
  });

  // 載入嵌入的模型列表
  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (unitId) params.append('unitId', unitId);
      
      const response = await fetch(`/api/sketchfab/embeds?${params}`);
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error('載入模型失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, unitId]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // 提取iframe中的Sketchfab URL信息
  const extractSketchfabInfo = (iframeCode) => {
    try {
      const srcMatch = iframeCode.match(/src="([^"]+)"/);
      if (srcMatch) {
        const url = srcMatch[1];
        const modelIdMatch = url.match(/models\/([^/]+)/);
        return {
          url: url,
          modelId: modelIdMatch ? modelIdMatch[1] : null,
          isValid: url.includes('sketchfab.com')
        };
      }
      return { isValid: false };
    } catch (error) {
      return { isValid: false };
    }
  };

  // 添加新的嵌入模型
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.iframeCode.trim()) {
      alert('請貼上Sketchfab的iframe嵌入代碼');
      return;
    }

    const info = extractSketchfabInfo(formData.iframeCode);
    if (!info.isValid) {
      alert('請確保使用正確的Sketchfab iframe代碼');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/sketchfab/add-embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          projectId,
          unitId,
          sketchfabUrl: info.url,
          modelId: info.modelId
        }),
      });

      if (response.ok) {
        const newModel = await response.json();
        setModels(prev => [newModel, ...prev]);
        setFormData({ iframeCode: '', modelName: '', description: '' });
        setShowAddForm(false);
        if (onModelAdded) onModelAdded(newModel);
      } else {
        const error = await response.json();
        alert(`添加失敗: ${error.message}`);
      }
    } catch (error) {
      console.error('添加模型失敗:', error);
      alert('添加失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 刪除模型
  const handleDelete = async (modelId) => {
    if (!window.confirm('確定要刪除這個模型嗎？')) return;

    try {
      const response = await fetch(`/api/sketchfab/embeds/${modelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setModels(prev => prev.filter(m => m.id !== modelId));
      } else {
        alert('刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗，請稍後再試');
    }
  };

  return (
    <div className="sketchfab-embed-manager">
      {/* 標題區域 */}
      <div className="manager-header">
        <h3>🎨 3D模型展示管理</h3>
        <p>直接嵌入Sketchfab模型到你的MiC平台</p>
        <button 
          className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={loading}
        >
          {showAddForm ? '❌ 取消' : '➕ 添加模型'}
        </button>
      </div>

      {/* 添加表單 */}
      {showAddForm && (
        <div className="add-form-section">
          <div className="form-card">
            <h4>📋 添加新的3D模型</h4>
            <div className="iframe-instructions">
              <h5>🔧 如何獲取嵌入代碼：</h5>
              <ol>
                <li>在Sketchfab模型頁面點擊 <strong>"Embed"</strong> 按鈕</li>
                <li>複製 <code>&lt;iframe&gt;</code> 代碼</li>
                <li>貼上到下方輸入框中</li>
              </ol>
            </div>
            
            <form onSubmit={handleSubmit} className="add-form">
              <div className="form-group">
                <label>🎬 Sketchfab iframe 嵌入代碼</label>
                <textarea
                  value={formData.iframeCode}
                  onChange={(e) => setFormData(prev => ({...prev, iframeCode: e.target.value}))}
                  placeholder='貼上類似: <iframe title="..." src="https://sketchfab.com/models/..." width="640" height="480" frameborder="0" allowfullscreen...</iframe>'
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>📛 模型名稱</label>
                <input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData(prev => ({...prev, modelName: e.target.value}))}
                  placeholder="例如: 住宅單位3 - 結構模型"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>📝 描述（可選）</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="模型的詳細描述..."
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '⏳ 添加中...' : '✅ 添加模型'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 模型列表 */}
      <div className="models-section">
        <div className="section-header">
          <h4>📚 已添加的模型 ({models.length})</h4>
        </div>
        
        {loading && models.length === 0 ? (
          <div className="loading-state">⏳ 載入中...</div>
        ) : models.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h5>還沒有添加任何模型</h5>
            <p>點擊上方按鈕開始添加你的第一個3D模型</p>
          </div>
        ) : (
          <div className="models-grid">
            {models.map((model) => (
              <div key={model.id} className="model-card">
                <div className="model-preview">
                  <div 
                    className="iframe-container"
                    dangerouslySetInnerHTML={{ __html: model.iframeCode }}
                  />
                </div>
                
                <div className="model-info">
                  <h5 className="model-name">{model.modelName}</h5>
                  {model.description && (
                    <p className="model-description">{model.description}</p>
                  )}
                  <div className="model-meta">
                    <span className="model-date">
                      📅 {new Date(model.createdAt).toLocaleDateString('zh-TW')}
                    </span>
                  </div>
                  
                  <div className="model-actions">
                    <button
                      className="btn btn-view"
                      onClick={() => window.open(model.sketchfabUrl, '_blank')}
                    >
                      🚀 Sketchfab
                    </button>
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(model.id)}
                    >
                      🗑️ 刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SketchfabEmbedManager; 