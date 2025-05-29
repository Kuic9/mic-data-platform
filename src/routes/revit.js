const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const router = express.Router();

// 配置文件上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/revit');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.rvt', '.ifc', '.glb', '.obj', '.fbx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB 限制
  }
});

// 模擬數據庫
let models = [];
let micModules = [];

/**
 * 上傳並處理 Revit 文件
 */
router.post('/upload', upload.single('revitFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳文件' });
    }

    const { originalname, filename, path: filePath } = req.file;
    const options = JSON.parse(req.body.options || '{}');

    // 創建模型記錄
    const model = {
      id: Date.now().toString(),
      name: originalname,
      filename,
      filePath,
      type: path.extname(originalname).toLowerCase(),
      status: 'processing',
      uploadTime: new Date().toISOString(),
      size: req.file.size,
      options
    };

    models.push(model);

    // 異步處理文件轉換
    processRevitFile(model)
      .then(() => {
        console.log(`模型 ${model.name} 處理完成`);
      })
      .catch(error => {
        console.error(`模型 ${model.name} 處理失敗:`, error);
        model.status = 'error';
        model.error = error.message;
      });

    res.json({
      success: true,
      model: {
        id: model.id,
        name: model.name,
        status: model.status
      }
    });

  } catch (error) {
    console.error('文件上傳錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 獲取所有模型
 */
router.get('/models', (req, res) => {
  res.json(models.map(model => ({
    id: model.id,
    name: model.name,
    type: model.type,
    status: model.status,
    uploadTime: model.uploadTime,
    size: model.size
  })));
});

/**
 * 獲取特定模型詳情
 */
router.get('/models/:id', (req, res) => {
  const model = models.find(m => m.id === req.params.id);
  if (!model) {
    return res.status(404).json({ error: '模型不存在' });
  }
  res.json(model);
});

/**
 * 獲取模型的 MiC 模組
 */
router.get('/models/:id/mic-modules', (req, res) => {
  const modelModules = micModules.filter(m => m.modelId === req.params.id);
  res.json(modelModules);
});

/**
 * 更新 MiC 模組
 */
router.put('/models/:modelId/mic-modules/:moduleId', (req, res) => {
  const moduleIndex = micModules.findIndex(
    m => m.id === req.params.moduleId && m.modelId === req.params.modelId
  );
  
  if (moduleIndex === -1) {
    return res.status(404).json({ error: '模組不存在' });
  }

  micModules[moduleIndex] = { ...micModules[moduleIndex], ...req.body };
  res.json(micModules[moduleIndex]);
});

/**
 * 生成 VR 場景
 */
router.post('/models/:id/vr-scene', async (req, res) => {
  try {
    const model = models.find(m => m.id === req.params.id);
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    const { options } = req.body;
    
    // 生成 VR 場景配置
    const vrScene = await generateVRScene(model, options);
    
    res.json({
      success: true,
      vrScene
    });

  } catch (error) {
    console.error('VR 場景生成錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 導出模型
 */
router.get('/models/:id/export/:format', async (req, res) => {
  try {
    const model = models.find(m => m.id === req.params.id);
    if (!model) {
      return res.status(404).json({ error: '模型不存在' });
    }

    const { format } = req.params;
    const exportPath = await exportModel(model, format);
    
    res.download(exportPath, `${model.name}.${format}`);

  } catch (error) {
    console.error('模型導出錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 解析 IFC 文件
 */
router.post('/parse-ifc', upload.single('ifcFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '沒有上傳 IFC 文件' });
    }

    const ifcData = await parseIFCFile(req.file.path);
    
    res.json({
      success: true,
      data: ifcData
    });

  } catch (error) {
    console.error('IFC 解析錯誤:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 搜索建築構件
 */
router.post('/models/:id/search', (req, res) => {
  const { searchCriteria } = req.body;
  
  // 模擬搜索結果
  const searchResults = [
    {
      id: '1',
      name: '外牆-001',
      type: 'Wall',
      category: 'Walls',
      material: '混凝土',
      properties: {
        thickness: 200,
        height: 3000,
        area: 25.5
      }
    },
    {
      id: '2',
      name: '門-001',
      type: 'Door',
      category: 'Doors',
      material: '木材',
      properties: {
        width: 900,
        height: 2100
      }
    }
  ];

  res.json(searchResults);
});

/**
 * 獲取材料庫
 */
router.get('/materials', (req, res) => {
  const materials = [
    {
      id: '1',
      name: '混凝土',
      type: 'concrete',
      properties: {
        density: 2400,
        strength: 'C30',
        color: '#808080'
      }
    },
    {
      id: '2',
      name: '鋼材',
      type: 'steel',
      properties: {
        density: 7850,
        grade: 'Q345',
        color: '#C0C0C0'
      }
    },
    {
      id: '3',
      name: '木材',
      type: 'wood',
      properties: {
        density: 600,
        species: '松木',
        color: '#DEB887'
      }
    }
  ];

  res.json(materials);
});

/**
 * 創建自定義 MiC 模組
 */
router.post('/mic-modules', (req, res) => {
  const newModule = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };

  micModules.push(newModule);
  res.json(newModule);
});

// 輔助函數

/**
 * 處理 Revit 文件轉換
 */
async function processRevitFile(model) {
  try {
    model.status = 'converting';
    
    const ext = model.type;
    let convertedPath;

    switch (ext) {
      case '.rvt':
        convertedPath = await convertRevitToGLB(model.filePath);
        break;
      case '.ifc':
        convertedPath = await convertIFCToGLB(model.filePath);
        break;
      case '.glb':
        convertedPath = model.filePath; // 已經是 GLB 格式
        break;
      default:
        throw new Error('不支持的文件格式');
    }

    model.convertedPath = convertedPath;
    model.status = 'completed';

    // 提取 MiC 模組信息
    await extractMicModules(model);

  } catch (error) {
    model.status = 'error';
    model.error = error.message;
    throw error;
  }
}

/**
 * 轉換 Revit 文件為 GLB
 */
async function convertRevitToGLB(filePath) {
  // 這裡需要實際的 Revit 轉換工具
  // 可以使用 Autodesk Forge API 或其他轉換工具
  
  // 模擬轉換過程
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const outputPath = filePath.replace('.rvt', '.glb');
  // 實際轉換邏輯...
  
  return outputPath;
}

/**
 * 轉換 IFC 文件為 GLB
 */
async function convertIFCToGLB(filePath) {
  // 使用 IFC.js 或其他 IFC 處理庫
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const outputPath = filePath.replace('.ifc', '.glb');
  // 實際轉換邏輯...
  
  return outputPath;
}

/**
 * 提取 MiC 模組信息
 */
async function extractMicModules(model) {
  // 分析模型並提取 MiC 模組
  const extractedModules = [
    {
      id: `${model.id}_module_1`,
      modelId: model.id,
      name: '浴室模組',
      type: 'bathroom',
      status: 'completed',
      dimensions: { width: 2.5, height: 2.8, depth: 3.0 },
      materials: ['瓷磚', '不鏽鋼', '玻璃'],
      position: { x: 0, y: 0, z: 0 },
      extractedAt: new Date().toISOString()
    },
    {
      id: `${model.id}_module_2`,
      modelId: model.id,
      name: '廚房模組',
      type: 'kitchen',
      status: 'in-progress',
      dimensions: { width: 3.0, height: 2.8, depth: 4.0 },
      materials: ['石英石', '不鏽鋼', '木材'],
      position: { x: 3, y: 0, z: 0 },
      extractedAt: new Date().toISOString()
    }
  ];

  micModules.push(...extractedModules);
}

/**
 * 生成 VR 場景配置
 */
async function generateVRScene(model, options) {
  const vrScene = {
    id: `vr_${model.id}`,
    modelId: model.id,
    environment: options.includeEnvironment ? 'forest' : 'none',
    lighting: {
      ambient: { color: '#404040', intensity: 0.4 },
      directional: { color: '#FFFFFF', intensity: 0.8, position: [5, 10, 5] }
    },
    camera: {
      position: [0, 1.6, 8],
      target: [0, 0, 0]
    },
    modules: micModules.filter(m => m.modelId === model.id),
    optimizations: options.optimizeForVR ? {
      lodLevels: 3,
      textureCompression: true,
      geometrySimplification: true
    } : {},
    createdAt: new Date().toISOString()
  };

  return vrScene;
}

/**
 * 導出模型
 */
async function exportModel(model, format) {
  const outputDir = path.join(__dirname, '../../exports');
  const outputPath = path.join(outputDir, `${model.id}.${format}`);

  // 確保輸出目錄存在
  await fs.mkdir(outputDir, { recursive: true });

  // 根據格式進行轉換
  switch (format) {
    case 'glb':
      // 如果已經是 GLB，直接複製
      if (model.convertedPath) {
        await fs.copyFile(model.convertedPath, outputPath);
      }
      break;
    case 'obj':
      // 轉換為 OBJ 格式
      await convertToOBJ(model.convertedPath, outputPath);
      break;
    case 'fbx':
      // 轉換為 FBX 格式
      await convertToFBX(model.convertedPath, outputPath);
      break;
    default:
      throw new Error('不支持的導出格式');
  }

  return outputPath;
}

/**
 * 解析 IFC 文件
 */
async function parseIFCFile(filePath) {
  // 使用 IFC.js 或其他 IFC 解析庫
  const ifcData = {
    version: 'IFC4',
    project: {
      name: '示例項目',
      description: '從 IFC 文件解析的項目'
    },
    buildings: [
      {
        id: 'building_1',
        name: '主建築',
        floors: [
          {
            id: 'floor_1',
            name: '一樓',
            elevation: 0
          }
        ]
      }
    ],
    elements: [
      {
        id: 'wall_1',
        type: 'IfcWall',
        name: '外牆',
        material: '混凝土'
      }
    ]
  };

  return ifcData;
}

/**
 * 轉換為 OBJ 格式
 */
async function convertToOBJ(inputPath, outputPath) {
  // 實際轉換邏輯
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * 轉換為 FBX 格式
 */
async function convertToFBX(inputPath, outputPath) {
  // 實際轉換邏輯
  await new Promise(resolve => setTimeout(resolve, 1000));
}

module.exports = router; 