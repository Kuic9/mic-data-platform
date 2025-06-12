const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// 配置multer用於文件上傳
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/models');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `model-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.ifc', '.glb', '.gltf', '.fbx', '.rvt', '.rfa'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'), false);
    }
  }
});

const MODELS_JSON_PATH = path.join(__dirname, '../../data/models.json');
let modelsDb = new Map();

// 輔助函數：保存 modelsDb 到 JSON 文件
async function saveModelsDb() {
  const arr = Array.from(modelsDb.entries());
  await fs.writeFile(MODELS_JSON_PATH, JSON.stringify(arr, null, 2), 'utf-8');
}

// 輔助函數：從 JSON 文件加載 modelsDb
async function loadModelsDb() {
  try {
    const content = await fs.readFile(MODELS_JSON_PATH, 'utf-8');
    const arr = JSON.parse(content);
    modelsDb = new Map(arr);
  } catch (e) {
    modelsDb = new Map(); // 文件不存在時初始化為空
  }
}

// 啟動時自動加載
loadModelsDb();

// 公開的獲取模型列表 API（不需要登錄）
router.get('/public-models', async (req, res) => {
  try {
    const { projectId, unitId } = req.query;
    
    let models = Array.from(modelsDb.values());
    
    if (projectId) {
      models = models.filter(model => model.projectId === projectId);
    }
    
    if (unitId) {
      models = models.filter(model => model.unitId === unitId);
    }

    const modelList = models.map(model => ({
      id: model.id,
      name: model.name,
      format: model.format,
      size: model.size,
      uploadTime: model.uploadTime,
      status: model.status,
      type: model.format, // 兼容前端期望的 type 字段
      url: model.url
    }));

    res.json(modelList);

  } catch (error) {
    console.error('獲取公開模型列表錯誤:', error);
    res.status(500).json({ error: '獲取模型列表失敗' });
  }
});

// 公開的獲取 MiC 模組 API（基於模型生成虛擬模組）
router.get('/public-models/:modelId/mic-modules', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    // 基於模型生成虛擬 MiC 模組
    const micModules = [
      {
        id: `${modelId}_module_1`,
        name: `${model.name} - Main Module`,
        type: model.format === '.ifc' ? 'structural' : 'generic',
        status: 'completed',
        dimensions: { width: 3.0, height: 2.8, depth: 4.0 },
        materials: ['Concrete', 'Steel'],
        position: { x: 0, y: 0, z: 0 },
        modelUrl: model.url,
        modelFormat: model.format
      }
    ];

    res.json(micModules);

  } catch (error) {
    console.error('獲取公開 MiC 模組錯誤:', error);
    res.status(500).json({ error: '獲取 MiC 模組失敗' });
  }
});

// 上傳Revit模型
router.post('/upload-model', upload.single('model'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳文件' });
    }

    const { projectId, unitId, fileName } = req.body;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // 生成模型ID
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 創建模型記錄
    const modelRecord = {
      id: modelId,
      name: fileName || req.file.originalname,
      format: fileExt,
      size: req.file.size,
      path: req.file.path,
      url: `/api/viewer/models/${modelId}/file`,
      projectId: projectId,
      unitId: unitId,
      uploadTime: new Date().toISOString(),
      status: 'uploaded'
    };

    // 保存到模型數據庫
    modelsDb.set(modelId, modelRecord);
    await saveModelsDb();

    // 如果是IFC文件，進行額外處理
    if (fileExt === '.ifc') {
      try {
        await processIFCFile(req.file.path, modelRecord);
      } catch (error) {
        console.warn('IFC處理失敗，但文件上傳成功:', error.message);
      }
    }

    res.json({
      success: true,
      model: {
        id: modelRecord.id,
        name: modelRecord.name,
        format: modelRecord.format,
        size: modelRecord.size,
        url: modelRecord.url,
        uploadTime: modelRecord.uploadTime
      }
    });

  } catch (error) {
    console.error('模型上傳錯誤:', error);
    res.status(500).json({ error: '模型上傳失敗' });
  }
});

// 獲取單位的所有模型
router.get('/units/:unitId/models', async (req, res) => {
  try {
    const { unitId } = req.params;
    
    let models = Array.from(modelsDb.values());
    
    // 過濾該單位的模型
    models = models.filter(model => model.unitId === unitId);

    const modelList = models.map(model => ({
        id: model.id,
        name: model.name,
        format: model.format,
        size: model.size,
      uploadTime: model.uploadTime,
      status: model.status,
      url: model.url
      }));

    res.json(modelList);

  } catch (error) {
    console.error('獲取單位模型列表錯誤:', error);
    res.status(500).json({ error: '獲取模型列表失敗' });
  }
});

// 提供模型文件
router.get('/models/:modelId/file', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    // 檢查文件是否存在
    try {
      await fs.access(model.path);
    } catch (error) {
      return res.status(404).json({ error: '模型文件不存在' });
    }

    // 設置正確的Content-Type
    const contentTypes = {
      '.ifc': 'application/octet-stream',
      '.glb': 'model/gltf-binary',
      '.gltf': 'model/gltf+json',
      '.fbx': 'application/octet-stream',
      '.rvt': 'application/octet-stream'
    };

    const contentType = contentTypes[model.format] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${model.name}"`);
    
    // 發送文件
    res.sendFile(path.resolve(model.path));

  } catch (error) {
    console.error('提供模型文件錯誤:', error);
    res.status(500).json({ error: '提供模型文件失敗' });
  }
});

// 3D模型檢視器端點 (支援IFC, FBX, GLB, GLTF等格式)
router.get('/viewer/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model) {
      return res.status(404).json({ error: '找不到模型' });
    }
    
    // 支援的3D格式
    const supportedFormats = ['.ifc', '.fbx', '.glb', '.gltf'];
    if (!supportedFormats.includes(model.format)) {
      return res.status(400).json({ error: `不支援的格式: ${model.format}` });
    }

    // 確保使用正確的文件URL（兼容舊記錄）
    let fileUrl = model.url;
    if (fileUrl.startsWith('/api/revit/models/')) {
      fileUrl = fileUrl.replace('/api/revit/models/', '/api/viewer/models/');
    }

    // 返回簡化的3D檢視器HTML
    const viewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>3D Model Viewer - ${model.name}</title>
        <script src="https://unpkg.com/three@0.150.0/build/three.min.js"></script>
        <script src="https://unpkg.com/three@0.150.0/examples/js/controls/OrbitControls.js"></script>
        <script src="https://unpkg.com/three@0.150.0/examples/js/loaders/GLTFLoader.js"></script>
        <script src="https://unpkg.com/three@0.150.0/examples/js/loaders/FBXLoader.js"></script>
        <style>
            body { 
                margin: 0; 
                overflow: hidden; 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background: #2c3e50; 
            }
            #viewer-container { 
                width: 100vw; 
                height: 100vh; 
                position: relative; 
            }
            #loading { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                background: rgba(44, 62, 80, 0.95);
                color: white;
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 1000;
                border: 2px solid #3498db;
            }
            .loading-spinner {
                border: 4px solid #34495e;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* 控制面板 */
            #control-panel {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(44, 62, 80, 0.9);
                padding: 20px;
                border-radius: 12px;
                color: white;
                z-index: 500;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                min-width: 250px;
                backdrop-filter: blur(10px);
            }
            
            .control-section {
                margin-bottom: 20px;
            }
            
            .control-section h4 {
                margin: 0 0 10px 0;
                color: #3498db;
                font-size: 14px;
                font-weight: 600;
            }
            
            .view-buttons {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .view-btn, .control-btn {
                padding: 8px 12px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .view-btn:hover, .control-btn:hover {
                background: #2980b9;
                transform: translateY(-1px);
            }
            
            .info-item {
                font-size: 12px;
                margin: 5px 0;
                color: #bdc3c7;
            }
            
            .info-item strong {
                color: #ecf0f1;
            }
            
            /* 透明度滑桿樣式 */
            input[type="range"] {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 6px;
                background: #34495e;
                border-radius: 3px;
                outline: none;
                margin: 5px 0;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                background: #3498db;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            }
            
            .toggle-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(44, 62, 80, 0.9);
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 8px;
                cursor: pointer;
                z-index: 501;
                font-size: 12px;
            }
            
            #instructions {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(44, 62, 80, 0.9);
                padding: 15px;
                border-radius: 8px;
                color: white;
                z-index: 500;
                font-size: 12px;
                max-width: 300px;
            }
        </style>
    </head>
    <body>
        <div id="viewer-container">
            <div id="loading">
                <div class="loading-spinner"></div>
                <h3>載入 3D 模型中...</h3>
                <p><strong>模型:</strong> ${model.name}</p>
                <p><strong>大小:</strong> ${(model.size / 1024).toFixed(1)} KB</p>
                <p><strong>格式:</strong> ${model.format}</p>
                <p>正在創建簡化的3D視圖...</p>
            </div>
            
            <!-- 控制面板 -->
            <div id="control-panel" style="display: none;">
                <div class="control-section">
                    <h4>📐 模型資訊</h4>
                    <div class="info-item"><strong>名稱:</strong> ${model.name}</div>
                    <div class="info-item"><strong>大小:</strong> ${(model.size / 1024).toFixed(1)} KB</div>
                    <div class="info-item"><strong>格式:</strong> ${model.format}</div>
                </div>
                
                <div class="control-section">
                    <h4>👁️ 預設視角</h4>
                    <div class="view-buttons">
                        <button class="view-btn" onclick="setView('front')">正面</button>
                        <button class="view-btn" onclick="setView('back')">背面</button>
                        <button class="view-btn" onclick="setView('left')">左側</button>
                        <button class="view-btn" onclick="setView('right')">右側</button>
                        <button class="view-btn" onclick="setView('top')">頂部</button>
                        <button class="view-btn" onclick="setView('bottom')">底部</button>
                    </div>
                    <button class="control-btn" onclick="setView('isometric')" style="width: 100%; margin-bottom: 10px;">🎯 等軸視角</button>
                    <button class="control-btn" onclick="fitToFrame()" style="width: 100%;">📏 適應畫面</button>
                </div>
                
                <div class="control-section">
                    <h4>🎨 材質控制</h4>
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 12px; color: #bdc3c7;">透明度: <span id="opacity-value">75%</span></label>
                        <input type="range" id="opacity-slider" min="10" max="100" value="75" onchange="updateOpacity(this.value)">
                    </div>
                    <button class="control-btn" onclick="toggleWireframe()" style="width: 100%; margin-bottom: 8px;">⚡ 切換線框</button>
                    <button class="control-btn" onclick="createSimpleStructure()" style="width: 100%;">🏗️ 簡化結構</button>
                </div>
            </div>
            
            <!-- 操作說明 -->
            <div id="instructions" style="display: none;">
                <h4 style="margin: 0 0 10px 0; color: #3498db;">🖱️ 操作說明</h4>
                <p style="margin: 5px 0; font-size: 11px;">• 左鍵拖拽：旋轉視角</p>
                <p style="margin: 5px 0; font-size: 11px;">• 右鍵拖拽：平移視角</p>
                <p style="margin: 5px 0; font-size: 11px;">• 滾輪：縮放</p>
                <p style="margin: 5px 0; font-size: 11px;">• 透明度滑桿：調整透明度</p>
                <p style="margin: 5px 0; font-size: 11px;">• 線框模式：查看結構</p>
            </div>
            
            <!-- 切換按鈕 -->
            <button class="toggle-btn" onclick="toggleControls()">🎛️ 控制面板</button>
        </div>
        
        <script>
            console.log('🚀 初始化 3D 檢視器...');
            
            let scene, camera, renderer, controls;
            let controlsVisible = false;
            let currentOpacity = 0.75;
            let isWireframe = false;
            let modelGroup;
            
            function init() {
                // 創建場景
                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x263238);
                
                // 創建相機
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                camera.position.set(10, 10, 10);
                
                // 創建渲染器
                renderer = new THREE.WebGLRenderer({ antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.shadowMap.enabled = true;
                document.getElementById('viewer-container').appendChild(renderer.domElement);
                
                // 創建控制器
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                
                // 添加燈光
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
                scene.add(ambientLight);
                
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
                directionalLight.position.set(10, 10, 5);
                scene.add(directionalLight);
                
                                 // 載入實際的3D模型
                 loadModel('${fileUrl}', '${model.format}');
                 
                 // 開始渲染
                 animate();
                
                // 窗口調整
                window.addEventListener('resize', onWindowResize);
            }
            
                         // 載入實際的3D模型文件
             function loadModel(url, format) {
                 console.log('📦 開始載入模型:', url, format);
                 
                 let loader;
                 
                 switch(format) {
                     case '.fbx':
                         loader = new THREE.FBXLoader();
                         break;
                     case '.glb':
                     case '.gltf':
                         loader = new THREE.GLTFLoader();
                         break;
                     case '.ifc':
                     default:
                         // 對於IFC或其他格式，創建示例模型
                         createSimpleBuilding();
                         return;
                 }
                 
                 loader.load(
                     url,
                     function(object) {
                         console.log('✅ 模型載入成功！');
                         
                         // 根據載入器類型處理模型
                         if (format === '.gltf' || format === '.glb') {
                             modelGroup = object.scene;
                         } else {
                             modelGroup = object;
                         }
                         
                         // 計算模型邊界並調整位置
                         const box = new THREE.Box3().setFromObject(modelGroup);
                         const center = box.getCenter(new THREE.Vector3());
                         const size = box.getSize(new THREE.Vector3());
                         
                         // 將模型居中
                         modelGroup.position.sub(center);
                         
                         // 添加到場景
                         scene.add(modelGroup);
                         
                         // 調整相機位置
                         const maxDim = Math.max(size.x, size.y, size.z);
                         const distance = maxDim * 2;
                         camera.position.set(distance, distance, distance);
                         camera.lookAt(0, 0, 0);
                         controls.target.set(0, 0, 0);
                         controls.update();
                         
                         // 應用透明度設置
                         applyTransparencyToModel();
                         
                         // 顯示控制面板
                         showControls();
                     },
                     function(progress) {
                         console.log('載入進度:', (progress.loaded / progress.total * 100) + '%');
                     },
                     function(error) {
                         console.error('❌ 模型載入失敗:', error);
                         // 載入失敗時創建示例模型
                         createSimpleBuilding();
                         showControls();
                     }
                 );
             }
             
             // 創建示例建築模型（當實際模型載入失敗時使用）
             function createSimpleBuilding() {
                 modelGroup = new THREE.Group();
                 
                 // 創建主體結構 - 透明綠色盒子
                 const mainGeometry = new THREE.BoxGeometry(6, 4, 3);
                 const mainMaterial = new THREE.MeshLambertMaterial({ 
                     color: 0x4CAF50, 
                     transparent: true, 
                     opacity: 0.7 
                 });
                 const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
                 mainBuilding.position.y = 2;
                 modelGroup.add(mainBuilding);
                 
                 // 創建門 - 棕色
                 const doorGeometry = new THREE.BoxGeometry(1, 2, 0.2);
                 const doorMaterial = new THREE.MeshLambertMaterial({ 
                     color: 0x8B4513, 
                     transparent: true, 
                     opacity: 0.8 
                 });
                 const door = new THREE.Mesh(doorGeometry, doorMaterial);
                 door.position.set(0, 1, 1.6);
                 modelGroup.add(door);
                 
                 // 創建窗戶 - 淺藍色
                 const windowGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
                 const windowMaterial = new THREE.MeshLambertMaterial({ 
                     color: 0x87CEEB, 
                     transparent: true, 
                     opacity: 0.5 
                 });
                 
                 // 左窗
                 const leftWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                 leftWindow.position.set(-1.5, 2.5, 1.55);
                 modelGroup.add(leftWindow);
                 
                 // 右窗
                 const rightWindow = new THREE.Mesh(windowGeometry, windowMaterial);
                 rightWindow.position.set(1.5, 2.5, 1.55);
                 modelGroup.add(rightWindow);
                 
                 // 創建屋頂 - 深灰色
                 const roofGeometry = new THREE.ConeGeometry(4, 2, 4);
                 const roofMaterial = new THREE.MeshLambertMaterial({ 
                     color: 0x2F4F4F, 
                     transparent: true, 
                     opacity: 0.8 
                 });
                 const roof = new THREE.Mesh(roofGeometry, roofMaterial);
                 roof.position.y = 5;
                 roof.rotation.y = Math.PI / 4;
                 modelGroup.add(roof);
                 
                 // 添加到場景
                 scene.add(modelGroup);
                 
                 console.log('✅ 示例建築模型創建完成');
             }
             
             // 顯示控制面板
             function showControls() {
                    document.getElementById('loading').style.display = 'none';
                 document.getElementById('control-panel').style.display = 'block';
                 document.getElementById('instructions').style.display = 'block';
                 controlsVisible = true;
                 updateOpacity(75);
             }
             
             // 應用透明度到模型
             function applyTransparencyToModel() {
                 if (modelGroup) {
                     modelGroup.traverse((child) => {
                         if (child.isMesh && child.material) {
                             if (Array.isArray(child.material)) {
                                 child.material.forEach(material => {
                                     material.transparent = true;
                                     material.opacity = 0.75;
                                     material.needsUpdate = true;
                                 });
                             } else {
                                 child.material.transparent = true;
                                 child.material.opacity = 0.75;
                                 child.material.needsUpdate = true;
                             }
                         }
                     });
                 }
             }
            
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
            
            function toggleControls() {
                controlsVisible = !controlsVisible;
                document.getElementById('control-panel').style.display = controlsVisible ? 'block' : 'none';
                document.getElementById('instructions').style.display = controlsVisible ? 'block' : 'none';
            }
            
            function setView(viewType) {
                const distance = 15;
                let position = new THREE.Vector3();
                
                switch(viewType) {
                    case 'front':
                        position.set(0, 5, distance);
                        break;
                    case 'back':
                        position.set(0, 5, -distance);
                        break;
                    case 'left':
                        position.set(-distance, 5, 0);
                        break;
                    case 'right':
                        position.set(distance, 5, 0);
                        break;
                    case 'top':
                        position.set(0, distance, 0);
                        break;
                    case 'bottom':
                        position.set(0, -distance, 0);
                        break;
                    case 'isometric':
                    default:
                        position.set(distance*0.7, distance*0.7, distance*0.7);
                        break;
                }
                
                camera.position.copy(position);
                camera.lookAt(0, 2, 0);
                controls.target.set(0, 2, 0);
                controls.update();
            }
            
            function fitToFrame() {
                setView('isometric');
            }
            
                         function updateOpacity(value) {
                 currentOpacity = value / 100;
                 document.getElementById('opacity-value').textContent = value + '%';
                 
                 if (modelGroup) {
                     modelGroup.traverse((child) => {
                         if (child.isMesh && child.material) {
                             if (Array.isArray(child.material)) {
                                 child.material.forEach(material => {
                                     material.transparent = true;
                                     material.opacity = currentOpacity;
                                     material.needsUpdate = true;
                                 });
                             } else {
                                 child.material.transparent = true;
                                 child.material.opacity = currentOpacity;
                                 child.material.needsUpdate = true;
                             }
                         }
                     });
                 }
             }
            
                         function toggleWireframe() {
                 isWireframe = !isWireframe;
                 
                 if (modelGroup) {
                     modelGroup.traverse((child) => {
                         if (child.isMesh && child.material) {
                             if (Array.isArray(child.material)) {
                                 child.material.forEach(material => {
                                     material.wireframe = isWireframe;
                                     material.needsUpdate = true;
                                 });
                             } else {
                                 child.material.wireframe = isWireframe;
                                 child.material.needsUpdate = true;
                             }
                         }
                     });
                 }
             }
            
            function createSimpleStructure() {
                // 重新創建更簡化的結構
                if (modelGroup) {
                    scene.remove(modelGroup);
                }
                createSimpleBuilding();
                updateOpacity(document.getElementById('opacity-slider').value);
            }
            
            // 初始化
            init();
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(viewerHtml);

  } catch (error) {
    console.error('3D檢視器錯誤:', error);
    res.status(500).json({ error: '3D檢視器錯誤' });
  }
});

// 獲取模型詳情
router.get('/models/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    res.json({
      id: model.id,
      name: model.name,
      format: model.format,
      size: model.size,
      uploadTime: model.uploadTime,
      projectId: model.projectId,
      unitId: model.unitId,
      status: model.status,
      url: model.url
    });

  } catch (error) {
    console.error('獲取模型詳情錯誤:', error);
    res.status(500).json({ error: '獲取模型詳情失敗' });
  }
});

// 刪除模型
router.delete('/models/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    // 刪除文件
    try {
      await fs.unlink(model.path);
    } catch (error) {
      console.warn('刪除模型文件失敗:', error.message);
    }

    // 從數據庫中刪除記錄
    modelsDb.delete(modelId);
    await saveModelsDb();

    res.json({ success: true, message: '模型已刪除' });

  } catch (error) {
    console.error('刪除模型錯誤:', error);
    res.status(500).json({ error: '刪除模型失敗' });
  }
});

// 獲取所有模型列表
router.get('/models', async (req, res) => {
  try {
    const { projectId, unitId } = req.query;
    
    let models = Array.from(modelsDb.values());
    
    if (projectId) {
      models = models.filter(model => model.projectId === projectId);
    }
    
    if (unitId) {
      models = models.filter(model => model.unitId === unitId);
    }

    const modelList = models.map(model => ({
      id: model.id,
      name: model.name,
      format: model.format,
      size: model.size,
      uploadTime: model.uploadTime,
      status: model.status
    }));

    res.json(modelList);

  } catch (error) {
    console.error('獲取模型列表錯誤:', error);
    res.status(500).json({ error: '獲取模型列表失敗' });
  }
});

// IFC文件處理函數
async function processIFCFile(filePath, modelRecord) {
  try {
    // 這裡可以添加IFC文件的實際處理邏輯
    // 例如：解析IFC結構、提取屬性、生成縮略圖等
    console.log(`處理IFC文件: ${filePath}`);
    
    // 更新模型狀態
    modelRecord.status = 'processed';
    modelRecord.processedAt = new Date().toISOString();
    
    return true;
  } catch (error) {
    console.error('IFC處理錯誤:', error);
    modelRecord.status = 'error';
    modelRecord.error = error.message;
    throw error;
  }
}

// Sketchfab模型嵌入檢視器
router.get('/sketchfab/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { sketchfabId } = req.query; // Sketchfab模型ID
    
    const model = modelsDb.get(modelId);
    if (!model) {
      return res.status(404).json({ error: '找不到模型記錄' });
    }

    // 如果沒有提供Sketchfab ID，返回設置頁面
    if (!sketchfabId) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Sketchfab 設置 - ${model.name}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', sans-serif; 
                    background: #f5f5f5; 
                    margin: 0; 
                    padding: 20px; 
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                h1 { color: #2c3e50; }
                .form-group { margin: 20px 0; }
                label { display: block; margin-bottom: 8px; font-weight: bold; }
                input[type="text"] {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    font-size: 16px;
                }
                .btn {
                    background: #3498db;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-right: 10px;
                }
                .btn:hover { background: #2980b9; }
                .btn-secondary { background: #95a5a6; }
                .btn-secondary:hover { background: #7f8c8d; }
                .help {
                    background: #e8f4fd;
                    padding: 15px;
                    border-radius: 6px;
                    margin: 20px 0;
                    border-left: 4px solid #3498db;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎨 Sketchfab 模型設置</h1>
                <p><strong>模型:</strong> ${model.name}</p>
                
                <div class="help">
                    <h3>如何獲取 Sketchfab 模型 ID：</h3>
                    <ol>
                        <li>在 Sketchfab 上打開您的模型頁面</li>
                        <li>從網址中複製模型ID（如：https://sketchfab.com/3d-models/[模型ID]）</li>
                        <li>貼上到下方輸入框中</li>
                    </ol>
                </div>
                
                <form onsubmit="embedModel(event)">
                    <div class="form-group">
                        <label for="sketchfab-id">Sketchfab 模型 ID:</label>
                        <input type="text" id="sketchfab-id" placeholder="例如: abc123def456..." required>
                    </div>
                    
                    <button type="submit" class="btn">🚀 嵌入模型</button>
                    <button type="button" class="btn btn-secondary" onclick="useLocalFile()">📁 使用本地文件</button>
                </form>
            </div>
            
            <script>
                function embedModel(event) {
                    event.preventDefault();
                    const sketchfabId = document.getElementById('sketchfab-id').value.trim();
                    if (sketchfabId) {
                        window.location.href = '?sketchfabId=' + encodeURIComponent(sketchfabId);
                    }
                }
                
                function useLocalFile() {
                    window.location.href = '/api/viewer/viewer/${modelId}';
                }
            </script>
        </body>
        </html>
      `);
    }

    // 有Sketchfab ID時，顯示嵌入檢視器
    const sketchfabViewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Sketchfab Viewer - ${model.name}</title>
        <style>
            body { 
                margin: 0; 
                overflow: hidden; 
                font-family: 'Segoe UI', sans-serif; 
                background: #2c3e50; 
            }
            #viewer-container { 
                width: 100vw; 
                height: 100vh; 
                position: relative; 
            }
            #sketchfab-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }
            .control-overlay {
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(44, 62, 80, 0.9);
                padding: 15px;
                border-radius: 8px;
                color: white;
                z-index: 1000;
                font-size: 14px;
            }
            .control-overlay h4 {
                margin: 0 0 10px 0;
                color: #3498db;
            }
            .btn {
                background: #3498db;
                color: white;
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin: 5px 5px 5px 0;
                font-size: 12px;
            }
            .btn:hover { background: #2980b9; }
        </style>
    </head>
    <body>
        <div id="viewer-container">
            <iframe 
                id="sketchfab-iframe"
                src="https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&ui_hint=0&ui_infos=0&ui_inspector=0&ui_stop=0&ui_watermark=1&ui_ar=1&ui_vr=1&ui_help=0&ui_settings=0&ui_annotations=0&ui_fullscreen=1&ui_loading=0"
                allow="autoplay; fullscreen; vr">
            </iframe>
            
            <div class="control-overlay">
                <h4>🎨 Sketchfab 模型</h4>
                <p><strong>模型:</strong> ${model.name}</p>
                <p><strong>ID:</strong> ${sketchfabId}</p>
                <button class="btn" onclick="openInSketchfab()">🔗 在 Sketchfab 中打開</button>
                <button class="btn" onclick="useLocalViewer()">📁 使用本地檢視器</button>
            </div>
        </div>
        
        <script>
            function openInSketchfab() {
                window.open('https://sketchfab.com/3d-models/${sketchfabId}', '_blank');
            }
            
            function useLocalViewer() {
                window.location.href = '/api/viewer/viewer/${modelId}';
            }
            
            // 監聽 iframe 載入
            document.getElementById('sketchfab-iframe').onload = function() {
                console.log('✅ Sketchfab 模型載入完成');
            };
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(sketchfabViewerHtml);

  } catch (error) {
    console.error('Sketchfab檢視器錯誤:', error);
    res.status(500).json({ error: 'Sketchfab檢視器錯誤' });
  }
});

module.exports = router; 