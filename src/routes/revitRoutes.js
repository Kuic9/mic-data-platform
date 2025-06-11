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

// 模型數據庫模型（簡化版，實際項目中應該使用正式的數據庫）
const modelsDb = new Map();

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
      url: `/api/revit/models/${modelId}/file`,
      projectId: projectId,
      unitId: unitId,
      uploadTime: new Date().toISOString(),
      status: 'uploaded'
    };

    // 保存到模型數據庫
    modelsDb.set(modelId, modelRecord);

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
    
    // 從數據庫中獲取該單位的模型
    const unitModels = Array.from(modelsDb.values())
      .filter(model => model.unitId === unitId)
      .map(model => ({
        id: model.id,
        name: model.name,
        format: model.format,
        size: model.size,
        url: model.url,
        uploadTime: model.uploadTime
      }));

    res.json(unitModels);
  } catch (error) {
    console.error('獲取模型列表錯誤:', error);
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

// IFC查看器端點
router.get('/viewer/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const model = modelsDb.get(modelId);
    
    if (!model || model.format !== '.ifc') {
      return res.status(404).json({ error: '找不到IFC模型' });
    }

    // 返回IFC查看器HTML
    const viewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>IFC Model Viewer</title>
        <script src="https://unpkg.com/web-ifc-viewer@1.0.161/dist/web-ifc-viewer.js"></script>
        <style>
            body { margin: 0; overflow: hidden; font-family: Arial, sans-serif; }
            #viewer-container { width: 100vw; height: 100vh; position: relative; }
            #loading { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%);
                background: rgba(255,255,255,0.9);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div id="viewer-container">
            <div id="loading">Loading IFC model...</div>
        </div>
        
        <script>
            const container = document.getElementById('viewer-container');
            const viewer = new IfcViewerAPI({ container });
            
            async function loadIFC() {
                try {
                    await viewer.IFC.setWasmPath('https://unpkg.com/web-ifc@0.0.46/');
                    await viewer.loadIfcUrl('${model.url}');
                    document.getElementById('loading').style.display = 'none';
                } catch (error) {
                    console.error('加載IFC模型失敗:', error);
                    document.getElementById('loading').innerHTML = 'Failed to load IFC model';
                }
            }
            
            loadIFC();
        </script>
    </body>
    </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(viewerHtml);

  } catch (error) {
    console.error('IFC查看器錯誤:', error);
    res.status(500).json({ error: 'IFC查看器錯誤' });
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

module.exports = router; 