const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();

// Embedded model data storage
const EMBED_JSON_PATH = path.join(__dirname, '../../data/sketchfab_embeds.json');
let embedModels = new Map();

// Load embedded models from file
async function loadEmbedModels() {
  try {
    const content = await fs.readFile(EMBED_JSON_PATH, 'utf-8');
    const arr = JSON.parse(content);
    embedModels = new Map(arr);
    console.log(`Loaded ${embedModels.size} embedded models from ${EMBED_JSON_PATH}`);
    
    // 打印所有模型的基本信息以便調試
    console.log("Models summary:");
    Array.from(embedModels.values()).forEach((model, index) => {
      console.log(`  ${index+1}. ID: ${model.id}, Name: ${model.modelName}, Module: ${model.moduleId || 'N/A'}, Unit: ${model.unitId || 'N/A'}`);
    });
  } catch (e) {
    console.error('Error loading embed models:', e);
    embedModels = new Map(); // Initialize as empty when file doesn't exist
    console.log('Initialize empty embedded model storage');
  }
}

// Save embedded models to file
async function saveEmbedModels() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(EMBED_JSON_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    const arr = Array.from(embedModels.entries());
    await fs.writeFile(EMBED_JSON_PATH, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save embedded models:', error);
  }
}

// Extract model ID from iframe code
function extractSketchfabModelId(iframeCode) {
  const regex = /src="https:\/\/sketchfab\.com\/models\/([^\/\?"]+)/;
  const match = iframeCode.match(regex);
  return match ? match[1] : null;
}

// Extract title from iframe
function extractTitle(iframeCode) {
  const titleMatch = iframeCode.match(/title="([^"]+)"/);
  return titleMatch ? titleMatch[1] : 'Untitled Model';
}

// Initialize
loadEmbedModels();

// Extract information from iframe code
function extractEmbedInfo(iframeCode) {
  try {
    // Extract src URL
    const srcMatch = iframeCode.match(/src=["']([^"']+)["']/);
    if (!srcMatch) return { isValid: false, error: 'Unable to find src attribute' };
    
    const srcUrl = srcMatch[1];
    
    // Check if it's a valid Sketchfab URL
    if (!srcUrl.includes('sketchfab.com')) {
      return { isValid: false, error: 'Not a valid Sketchfab URL' };
    }
    
    // Extract model ID
    const modelIdMatch = srcUrl.match(/models\/([^\/\?]+)/);
    const modelId = modelIdMatch ? modelIdMatch[1] : null;
    
    // Extract title
    const titleMatch = iframeCode.match(/title=["']([^"']+)["']/);
    const title = titleMatch ? titleMatch[1] : null;
    
    return {
      isValid: true,
      srcUrl,
      modelId,
      title,
      originalIframe: iframeCode
    };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

// Add embedded model
router.post('/add-embed', async (req, res) => {
  try {
    const { iframeCode, modelName, description, projectId, unitId, moduleId } = req.body;
    
    if (!iframeCode || !modelName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: iframe code and model name'
      });
    }
    
    // Extract and validate iframe information
    const embedInfo = extractEmbedInfo(iframeCode);
    if (!embedInfo.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid iframe code: ${embedInfo.error}` 
      });
    }
    
    // Generate unique ID
    const modelId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create model record
    const modelRecord = {
      id: modelId,
      modelName,
      description: description || '',
      iframeCode,
      sketchfabUrl: embedInfo.srcUrl,
      sketchfabModelId: embedInfo.modelId,
      extractedTitle: embedInfo.title,
      projectId: projectId || null,
      unitId: unitId || null,
      moduleId: moduleId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store in Map
    embedModels.set(modelId, modelRecord);
    
    // Persist to file
    await saveEmbedModels();
    
    res.json(modelRecord);
    
  } catch (error) {
    console.error('Failed to add embedded model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add embedded model'
    });
  }
});

// Get embedded model list
router.get('/models', async (req, res) => {
  try {
    const { projectId, unitId, moduleId } = req.query;
    console.log(`GET /models query:`, req.query);
    
    let models = Array.from(embedModels.values());
    console.log(`Total models before filtering: ${models.length}`);
    
    // Filter by project, unit, or module
    if (projectId) {
      console.log(`Filtering by projectId: ${projectId}`);
      models = models.filter(model => model.projectId === projectId);
      console.log(`After projectId filter: ${models.length} models`);
    }
    
    // Filter by unit
    if (unitId) {
      console.log(`Filtering by unitId: ${unitId}`);
      models = models.filter(model => model.unitId === unitId);
      console.log(`After unitId filter: ${models.length} models`);
    }
    
    // Filter by module
    if (moduleId) {
      console.log(`Filtering by moduleId: ${moduleId}`);
      models = models.filter(model => model.moduleId === moduleId);
      console.log(`After moduleId filter: ${models.length} models`);
      // 打印所有匹配的模型詳情
      models.forEach((model, i) => {
        console.log(`Module Model ${i+1}: ${model.id}, ${model.modelName}`);
      });
    }
    
    // Sort by creation time (newest first)
    models.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(models);
    
  } catch (error) {
    console.error('Failed to get embedded model list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model list'
    });
  }
});

// Get models for specific unit
router.get('/units/:unitId/models', async (req, res) => {
  try {
    const { unitId } = req.params;
    
    const models = Array.from(embedModels.values())
      .filter(model => model.unitId === unitId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(models);
    
  } catch (error) {
    console.error('Failed to get unit models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unit models'
    });
  }
});

// Get models for specific module
router.get('/modules/:moduleId/models', async (req, res) => {
  try {
    const { moduleId } = req.params;
    console.log(`GET /modules/${moduleId}/models`);
    
    const models = Array.from(embedModels.values())
      .filter(model => model.moduleId === moduleId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`Found ${models.length} models for moduleId ${moduleId}`);
    res.json(models);
    
  } catch (error) {
    console.error('Failed to get module models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get module models'
    });
  }
});

// Delete embedded model
router.delete('/models/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    if (!embedModels.has(modelId)) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      });
    }
    
    // 從Map中刪除
    embedModels.delete(modelId);
    
    // 持久化到文件
    await saveEmbedModels();
    
    res.json({
      success: true,
      message: 'Model deleted successfully'
    });
    
  } catch (error) {
    console.error('Failed to delete embedded model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete model'
    });
  }
});

// Update embedded model
router.put('/models/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { iframeCode, modelName, description } = req.body;
    
    if (!embedModels.has(modelId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Model not found' 
      });
    }
    
    const existingModel = embedModels.get(modelId);
    
    // 如果iframe代碼更新了，重新提取信息
    let updateData = { ...existingModel };
    
    if (iframeCode && iframeCode !== existingModel.iframeCode) {
      const embedInfo = extractEmbedInfo(iframeCode);
      if (!embedInfo.isValid) {
        return res.status(400).json({ 
          success: false, 
          message: `無效的iframe代碼: ${embedInfo.error}` 
        });
      }
      
      updateData.iframeCode = iframeCode;
      updateData.sketchfabUrl = embedInfo.srcUrl;
      updateData.sketchfabModelId = embedInfo.modelId;
      updateData.extractedTitle = embedInfo.title;
    }
    
    if (modelName) updateData.modelName = modelName;
    if (description !== undefined) updateData.description = description;
    updateData.updatedAt = new Date().toISOString();
    
    // 更新Map中的記錄
    embedModels.set(modelId, updateData);
    
    // 持久化到文件
    await saveEmbedModels();
    
    res.json({
      success: true,
      message: 'Model updated successfully',
      model: updateData
    });
    
  } catch (error) {
    console.error('Failed to update embedded model:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update model' 
    });
  }
});

// Get single model details
router.get('/models/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    if (!embedModels.has(modelId)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Model not found' 
      });
    }
    
    const model = embedModels.get(modelId);
    res.json(model);
    
  } catch (error) {
    console.error('Failed to get model details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get model details' 
    });
  }
});

// Full screen viewer page
router.get('/viewer/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    if (!embedModels.has(modelId)) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Model not found</title>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #dc3545; font-size: 1.2rem; }
            </style>
        </head>
        <body>
            <div class="error">❌ Model not found</div>
            <p>Please check if the model ID is correct</p>
            <button onclick="history.back()">← Back</button>
        </body>
        </html>
      `);
    }
    
    const model = embedModels.get(modelId);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>${model.modelName} - 3D Model Viewer</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
              }
              
              .header {
                  background: rgba(255, 255, 255, 0.95);
                  padding: 1rem 2rem;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .model-title {
                  font-size: 1.2rem;
                  color: #495057;
                  font-weight: 600;
              }
              
              .header-buttons {
                  display: flex;
                  gap: 1rem;
              }
              
              .btn {
                  padding: 0.5rem 1rem;
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: 600;
                  text-decoration: none;
                  transition: all 0.3s ease;
              }
              
              .btn-back {
                  background: #6c757d;
                  color: white;
              }
              
              .btn-sketchfab {
                  background: #1caad9;
                  color: white;
              }
              
              .btn:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              }
              
              .viewer-container {
                  flex: 1;
                  padding: 1rem;
              }
              
              .iframe-wrapper {
                  width: 100%;
                  height: 100%;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
              }
              
              .iframe-wrapper iframe {
                  width: 100%;
                  height: 100%;
                  border: none;
              }
              
              @media (max-width: 768px) {
                  .header {
                      padding: 1rem;
                      flex-direction: column;
                      gap: 1rem;
                  }
                  
                  .header-buttons {
                      width: 100%;
                      justify-content: center;
                  }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <div class="model-title">🎨 ${model.modelName}</div>
              <div class="header-buttons">
                  <button class="btn btn-back" onclick="history.back()">← Back</button>
                  <a href="${model.sketchfabUrl}" target="_blank" class="btn btn-sketchfab">🚀 Open in Sketchfab</a>
              </div>
          </div>
          
          <div class="viewer-container">
              <div class="iframe-wrapper">
                  ${model.iframeCode}
              </div>
          </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Failed to generate viewer page:', error);
    res.status(500).send('Server internal error');
  }
});

module.exports = router; 