import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SimpleSketchfabManager.css';

const SimpleSketchfabManager = ({ projectId, unitId, moduleId, modules = [] }) => {
  const [models, setModels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [iframeCode, setIframeCode] = useState('');
  const [modelName, setModelName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, hasPermission, apiCall } = useAuth();
  
  // 檢查用戶是否有上傳權限
  const canUploadModel = user && (user.role === 'admin' || hasPermission('data_input') || hasPermission('admin'));
  
  // 檢查當前是否已有模型
  const hasModels = models && models.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!iframeCode.trim() || !modelName.trim()) {
      setError('請填寫所有必填字段');
      return;
    }
    
    try {
      setError(null);
      console.log('正在提交模型...', { modelName: modelName.trim(), moduleId, unitId, projectId });
      
      const response = await apiCall('/api/sketchfab/add-embed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          iframeCode: iframeCode.trim(),
          modelName: modelName.trim(),
          description: '',
          projectId,
          unitId,
          moduleId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('模型添加成功:', result);
        setIframeCode('');
        setModelName('');
        setShowForm(false);
        setError(null);
        loadModels(); // 重新載入模型列表
      } else {
        const errorData = await response.json().catch(() => ({ message: '未知錯誤' }));
        console.error('提交失敗:', response.status, errorData);
        setError(`提交失敗: ${errorData.message || '服務器錯誤'}`);
      }
    } catch (error) {
      console.error('提交失敗:', error);
      setError(`提交失敗: ${error.message || '請檢查網絡連接'}`);
    }
  };

  const loadModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('開始載入模型...');
      
      // 簡化邏輯：如果是模塊頁面，直接載入該模塊的模型
      if (moduleId) {
        const url = `/api/sketchfab/modules/${moduleId}/models`;
        console.log(`載入模塊 ${moduleId} 的模型...`);
        
        const response = await apiCall(url);
        if (response.ok) {
          const data = await response.json();
          console.log(`模塊模型載入成功: ${data.length} 個`);
          setModels(data);
        } else {
          console.log('模塊模型載入失敗');
          setModels([]);
        }
        return;
      }
      
      // 如果是單元頁面，載入所有相關模型
      if (unitId) {
        console.log(`載入單元 ${unitId} 的模型...`);
        let allModels = [];
        
        // 1. 載入直接關聯到單元的模型
        try {
          const unitResponse = await apiCall(`/api/sketchfab/units/${unitId}/models`);
          if (unitResponse.ok) {
            const unitModels = await unitResponse.json();
            console.log(`單元直接模型: ${unitModels.length} 個`);
            allModels.push(...unitModels);
          }
        } catch (err) {
          console.error('載入單元模型錯誤:', err);
        }
        
        // 2. 載入模塊關聯的模型
        if (modules.length > 0) {
          for (const module of modules) {
            try {
              const moduleResponse = await apiCall(`/api/sketchfab/modules/${module.module_id}/models`);
              if (moduleResponse.ok) {
                const moduleModels = await moduleResponse.json();
                if (moduleModels.length > 0) {
                  console.log(`模塊 ${module.module_id} 模型: ${moduleModels.length} 個`);
                  allModels.push(...moduleModels);
                }
              }
            } catch (err) {
              console.error(`載入模塊 ${module.module_id} 模型錯誤:`, err);
            }
          }
        }
        
        // 去重所有模型（用於側邊欄狀態檢測）
        const uniqueModels = [];
        const seenIds = new Set();
        
        for (const model of allModels) {
          if (!seenIds.has(model.id)) {
            seenIds.add(model.id);
            uniqueModels.push(model);
          }
        }
        
        console.log(`最終載入模型: ${uniqueModels.length} 個`);
        console.log('所有模型詳情:', uniqueModels.map(m => ({ id: m.id, name: m.modelName, moduleId: m.moduleId, unitId: m.unitId })));
        setModels(uniqueModels);
        return;
      }
      
      // 其他情況的載入邏輯...
      console.log('載入所有模型...');
      setModels([]);
      
    } catch (error) {
      console.error('載入模型時發生錯誤:', error);
      setError('載入模型失敗，請重試');
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [moduleId, unitId, apiCall]); // 移除modules依賴，避免無限循環

  // Simple model loading
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Dynamic iframe height and interaction adjustment
  useEffect(() => {
    const adjustIframeHeight = () => {
      const iframes = document.querySelectorAll('.sketchfab-model-card iframe');
      iframes.forEach(iframe => {
        iframe.style.setProperty('height', '600px', 'important');
        iframe.style.setProperty('min-height', '600px', 'important');
        iframe.style.setProperty('max-height', '600px', 'important');
        iframe.style.setProperty('width', '100%', 'important');
        iframe.style.setProperty('display', 'block', 'important');
        iframe.style.setProperty('pointer-events', 'auto', 'important');
        iframe.style.setProperty('box-sizing', 'border-box', 'important');
      });
    };

    // Immediate adjustment
    adjustIframeHeight();
    
    // Delayed adjustment to ensure iframe is loaded
    const timer1 = setTimeout(adjustIframeHeight, 500);
    const timer2 = setTimeout(adjustIframeHeight, 1500);
    const timer3 = setTimeout(adjustIframeHeight, 3000);
    
    // Continuous monitoring and adjustment
    const interval = setInterval(adjustIframeHeight, 2000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, [models]);

  const navigateToModule = (moduleId) => {
    // Check if user is authenticated
    if (!user) {
      console.error('User not authenticated');
      alert('請先登錄以查看模塊詳情');
      return;
    }

    // Admin用戶有完整權限，其他用戶檢查read權限
    if (user.role !== 'admin' && !hasPermission('read')) {
      console.error('User lacks read permission, user role:', user.role);
      alert(`您沒有查看模塊詳情的權限。\n\n您的角色: ${user.role}`);
      return;
    }

    // Use React Router navigation
    try {
      navigate(`/modules/${moduleId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      alert('導航失敗，請重試');
    }
  };

  // 獲取模塊類型名稱
  const getModuleTypeName = () => {
    if (moduleId && modules.length > 0) {
      const module = modules.find(m => m.module_id === moduleId);
      return module ? module.module_type : '模塊';
    }
    return '單元';
  };

  // 根據不同頁面顯示不同的標題和模塊列表
  const renderTitle = () => {
    // 如果是從模塊詳情頁面打開（有單個module且不是從單元頁面打開）
    if (modules.length === 1 && moduleId && !unitId) {
      return `${modules[0].module_type || '模塊'}3D模型`;
    } 
    // 如果是從單元頁面打開
    else if (unitId) {
      return '單元模型';
    } 
    // 默認標題
    else {
      return '3D模型管理';
    }
  };

  // 判斷是否顯示模塊側邊欄
  const shouldShowModuleSidebar = () => {
    // 在單元頁面顯示模塊側邊欄
    return unitId && modules.length > 0;
  };

  const renderSidebar = () => {
    if (!modules || modules.length === 0) {
      return null;
    }

    return (
      <div className="module-sidebar">
        <h4 className="module-sidebar-title">單元模塊</h4>
        <p className="module-sidebar-description">
          此單元由 {modules.length} 個模塊組成
        </p>
        
        <div className="module-list">
          <div className="module-items">
            {modules.map((module) => {
              // 檢查此模塊是否已有模型
              const moduleId = module.module_id;
              const moduleModels = models.filter(model => model.moduleId === moduleId);
              const hasModel = moduleModels.length > 0;
              
              console.log(`模塊 ${moduleId} (${module.module_type}): 找到 ${moduleModels.length} 個模型`, moduleModels);
              
              const handleModuleClick = () => {
                navigate(`/modules/${module.module_id}`);
              };
              
              return (
                <div 
                  key={module.module_id} 
                  className="module-item clickable"
                  onClick={handleModuleClick}
                >
                  <div className="module-badge">
                    {module.module_type}
                    <span className={`model-status-badge ${hasModel ? 'has-model' : 'no-model'}`}>
                      {hasModel ? '已上傳' : '尚未上傳'}
                    </span>
                  </div>
                  
                  <div className="module-details">
                    <div className="module-specs">
                      <div className="module-spec">
                        <span className="spec-icon">🏭</span>
                        <span>CIMC MBS</span>
                      </div>
                      <div className="module-spec">
                        <span className="spec-icon">🔧</span>
                        <span>Steel Frame with Insulated panels</span>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sketchfab-manager-container">
      <div className="sketchfab-manager-header">
        <h3>🎨 {renderTitle()}</h3>
        {/* 移除重複的描述文本，只在沒有模型時顯示描述 */}
        {!hasModels && <p>{moduleId ? `${getModuleTypeName()}模型` : '請上傳單元模型'}</p>}
        
        {/* 只有有權限的用戶才能看到上傳按鈕，且沒有模型時才顯示 */}
        {canUploadModel && !hasModels && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`btn-action ${showForm ? 'btn-cancel' : 'btn-add'}`}
          >
            {showForm ? '取消' : '➕ 添加模型'}
          </button>
        )}
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
          <button className="btn-primary" onClick={loadModels}>重試</button>
        </div>
      )}
      
      {/* 模型上傳表單 - 只對有權限的用戶顯示，且無模型時才顯示 */}
      {showForm && canUploadModel && !hasModels && (
        <div className="model-form">
          <h4>添加新模型</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>模型名稱:</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="例如：住宅單元3 - 結構模型"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Sketchfab iframe代碼:</label>
              <textarea
                value={iframeCode}
                onChange={(e) => setIframeCode(e.target.value)}
                placeholder='粘貼完整的<iframe>代碼...'
                rows={4}
                required
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn-submit">
                ✅ 添加模型
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 模型顯示區域 */}
      <div className="models-section">
        <h4>模型 ({loading ? '載入中...' : models.length})</h4>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>載入模型中...</p>
          </div>
        ) : models.length === 0 ? (
          <div className="no-models-container">
            <div className="no-models-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M3 15h18"></path>
              </svg>
            </div>
            <p>尚未添加3D模型</p>
            {canUploadModel ? (
              <button className="btn-secondary" onClick={() => setShowForm(true)}>
                點擊此處添加您的第一個模型
              </button>
            ) : (
              <p className="permission-note">
                需要管理員權限才能上傳模型。<br />
                請聯繫系統管理員添加模型。
              </p>
            )}
          </div>
        ) : (
          <div className="models-container">
            {/* 左側模型區域 */}
            <div className="models-grid">
              {/* 優先顯示單元模型，如果沒有則顯示第一個模塊模型 */}
              {models.length > 0 && (() => {
                // 優先選擇單元模型
                const unitModel = models.find(model => model.unitId && !model.moduleId);
                const displayModel = unitModel || models[0];
                
                return (
                  <div className="sketchfab-model-card">
                    <div className="sketchfab-iframe-container">
                      <div 
                        className="sketchfab-iframe-inner"
                        dangerouslySetInnerHTML={{ 
                          __html: displayModel.iframeCode
                            .replace(/width="[^"]*"/g, 'width="100%"')
                            .replace(/height="[^"]*"/g, 'height="600px"')
                            .replace(/style="[^"]*"/g, 'style="width:100% !important;height:600px !important;min-height:600px !important;max-height:600px !important;border:none;display:block;pointer-events:auto;box-sizing:border-box !important;"')
                            .replace(/<iframe/, '<iframe style="width:100% !important;height:600px !important;min-height:600px !important;max-height:600px !important;border:none;display:block;pointer-events:auto;box-sizing:border-box !important;"')
                        }} 
                      />
                    </div>
                    <div className="model-info">
                      <h5>{displayModel.modelName}</h5>
                      <p className="model-date">
                        📅 {new Date(displayModel.createdAt).toLocaleDateString('zh-TW')}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* 右側模塊側邊欄 - 只在單元頁面且有多個模塊時顯示 */}
            {shouldShowModuleSidebar() && renderSidebar()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSketchfabManager; 