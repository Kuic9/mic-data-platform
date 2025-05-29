import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import VRViewer from '../components/VRViewer';
import revitService from '../services/revitService';

const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f5f5f5;
`;

const Sidebar = styled.div`
  width: 350px;
  background: white;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
`;

const MainContent = styled.div`
  flex: 1;
  position: relative;
`;

const SectionTitle = styled.h3`
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
`;

const FileUploadArea = styled.div`
  border: 2px dashed #007bff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #f8f9fa;
    border-color: #0056b3;
  }

  &.dragover {
    background: #e3f2fd;
    border-color: #1976d2;
  }
`;

const ModuleCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  &.selected {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  
  &.completed { background: #28a745; }
  &.in-progress { background: #ffc107; color: #212529; }
  &.pending { background: #6c757d; }
  &.error { background: #dc3545; }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;

  .progress-fill {
    height: 100%;
    background: #007bff;
    transition: width 0.3s ease;
  }
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  &.secondary {
    background: #6c757d;
  }

  &.danger {
    background: #dc3545;
  }
`;

const VRPage = () => {
  const location = useLocation();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [micModules, setMicModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 檢查是否從 Module 詳情頁面導航而來
    if (location.state?.selectedModule && location.state?.fromModuleDetail) {
      const moduleFromState = location.state.selectedModule;
      
      // 將單個模組轉換為 MiC 模組格式
      const convertedModule = {
        id: moduleFromState.module_id,
        name: `${moduleFromState.module_type} - ${moduleFromState.module_id}`,
        type: getModuleType(moduleFromState.module_type),
        status: moduleFromState.status.toLowerCase().replace(' ', '-'),
        dimensions: moduleFromState.dimensions || { width: 3.0, height: 2.8, depth: 4.0 },
        materials: [moduleFromState.major_material || '混凝土'],
        position: { x: 0, y: 0, z: 0 }
      };

      setMicModules([convertedModule]);
      setSelectedModule(convertedModule);
      
      // 創建虛擬模型
      const virtualModel = {
        id: `model_${moduleFromState.module_id}`,
        name: `模型 - ${moduleFromState.module_id}`,
        type: '.virtual',
        status: 'completed'
      };
      setModels([virtualModel]);
      setSelectedModel(virtualModel);
    } else {
      loadModels();
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedModel && !location.state?.fromModuleDetail) {
      loadMicModules(selectedModel.id);
    }
  }, [selectedModel]);

  const getModuleType = (moduleType) => {
    const typeMapping = {
      'bathroom': 'bathroom',
      'kitchen': 'kitchen', 
      'residential': 'bedroom',
      'office': 'office'
    };
    
    const type = moduleType.toLowerCase();
    for (const [key, value] of Object.entries(typeMapping)) {
      if (type.includes(key)) {
        return value;
      }
    }
    return 'bedroom'; // 默認類型
  };

  const loadModels = async () => {
    try {
      setLoading(true);
      const modelsData = await revitService.getConvertedModels();
      setModels(modelsData);
    } catch (error) {
      console.error('載入模型失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMicModules = async (modelId) => {
    try {
      const modulesData = await revitService.getMicModules(modelId);
      setMicModules(modulesData);
    } catch (error) {
      console.error('載入 MiC 模組失敗:', error);
      // 如果沒有真實數據，使用模擬數據
      setMicModules([
        {
          id: '1',
          name: '浴室模組 A',
          type: 'bathroom',
          status: 'completed',
          dimensions: { width: 2.5, height: 2.8, depth: 3.0 },
          materials: ['瓷磚', '不鏽鋼', '玻璃'],
          position: { x: 0, y: 0, z: 0 }
        },
        {
          id: '2',
          name: '廚房模組 B',
          type: 'kitchen',
          status: 'in-progress',
          dimensions: { width: 3.0, height: 2.8, depth: 4.0 },
          materials: ['石英石', '不鏽鋼', '木材'],
          position: { x: 3, y: 0, z: 0 }
        },
        {
          id: '3',
          name: '臥室模組 C',
          type: 'bedroom',
          status: 'pending',
          dimensions: { width: 4.0, height: 2.8, depth: 5.0 },
          materials: ['木地板', '石膏板', '玻璃'],
          position: { x: 6, y: 0, z: 0 }
        }
      ]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await revitService.uploadRevitFile(file, {
        onProgress: (progress) => setUploadProgress(progress)
      });

      console.log('文件上傳成功:', result);
      await loadModels(); // 重新載入模型列表
    } catch (error) {
      console.error('文件上傳失敗:', error);
      alert('文件上傳失敗，請檢查文件格式是否正確');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    const revitFile = files.find(file => 
      file.name.endsWith('.rvt') || 
      file.name.endsWith('.ifc') || 
      file.name.endsWith('.glb')
    );
    
    if (revitFile) {
      handleFileUpload(revitFile);
    } else {
      alert('請上傳 Revit (.rvt)、IFC (.ifc) 或 GLB (.glb) 文件');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const generateVRScene = async () => {
    if (!selectedModel) return;

    try {
      const vrScene = await revitService.generateVRScene(selectedModel.id, {
        includeEnvironment: true,
        optimizeForVR: true,
        micModules: micModules
      });
      console.log('VR 場景生成成功:', vrScene);
    } catch (error) {
      console.error('VR 場景生成失敗:', error);
    }
  };

  return (
    <PageContainer>
      <Sidebar>
        <SectionTitle>
          {location.state?.fromModuleDetail ? 'Module VR View' : 'Revit 模型管理'}
        </SectionTitle>
        
        {!location.state?.fromModuleDetail && (
          <>
            <FileUploadArea
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {isUploading ? (
                <div>
                  <p>上傳中... {uploadProgress}%</p>
                  <ProgressBar>
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </ProgressBar>
                </div>
              ) : (
                <div>
                  <p>拖拽 Revit 文件到此處</p>
                  <p>或點擊選擇文件</p>
                  <small>支持 .rvt, .ifc, .glb 格式</small>
                </div>
              )}
            </FileUploadArea>

            <input
              id="fileInput"
              type="file"
              accept=".rvt,.ifc,.glb"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files[0])}
            />

            <div>
              <h4>已導入模型</h4>
              {loading ? (
                <p>載入中...</p>
              ) : models.length === 0 ? (
                <p>暫無模型，請上傳 Revit 文件</p>
              ) : (
                models.map(model => (
                  <ModuleCard
                    key={model.id}
                    className={selectedModel?.id === model.id ? 'selected' : ''}
                    onClick={() => setSelectedModel(model)}
                  >
                    <h5>{model.name}</h5>
                    <p>類型: {model.type}</p>
                    <StatusBadge className={model.status}>
                      {model.status}
                    </StatusBadge>
                  </ModuleCard>
                ))
              )}
            </div>
          </>
        )}

        {selectedModel && (
          <>
            <SectionTitle>MiC 模組</SectionTitle>
            {!location.state?.fromModuleDetail && (
              <Button onClick={generateVRScene}>
                生成 VR 場景
              </Button>
            )}
            
            {micModules.map(module => (
              <ModuleCard
                key={module.id}
                className={selectedModule?.id === module.id ? 'selected' : ''}
                onClick={() => setSelectedModule(module)}
              >
                <h5>{module.name}</h5>
                <p>類型: {module.type}</p>
                <p>尺寸: {module.dimensions.width}×{module.dimensions.height}×{module.dimensions.depth}m</p>
                <StatusBadge className={module.status}>
                  {module.status}
                </StatusBadge>
                <div style={{ marginTop: '10px' }}>
                  <Button size="small">編輯</Button>
                  <Button size="small" className="secondary">複製</Button>
                </div>
              </ModuleCard>
            ))}
          </>
        )}

        {location.state?.fromModuleDetail && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
            <h4>模組資訊</h4>
            <p><strong>來源:</strong> Module Detail Page</p>
            <p><strong>模組 ID:</strong> {location.state.selectedModule?.module_id}</p>
            <p><strong>類型:</strong> {location.state.selectedModule?.module_type}</p>
          </div>
        )}
      </Sidebar>

      <MainContent>
        {selectedModel ? (
          <VRViewer 
            micModules={micModules}
            selectedModule={selectedModule}
          />
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            flexDirection: 'column',
            color: '#666'
          }}>
            <h2>歡迎使用 MiC VR 查看器</h2>
            <p>
              {location.state?.fromModuleDetail 
                ? '正在載入模組 VR 視圖...' 
                : '請先上傳 Revit 模型文件開始使用'
              }
            </p>
          </div>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default VRPage; 