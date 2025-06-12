// 添加單個模型到NC220-M001模組
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 配置文件路徑
const SKETCHFAB_DATA_PATH = path.join(__dirname, 'data', 'sketchfab_embeds.json');

// 確保目錄存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log(`創建目錄: ${dataDir}`);
}

// 讀取或創建模型數據
let sketchfabData = [];
if (fs.existsSync(SKETCHFAB_DATA_PATH)) {
  try {
    const rawData = fs.readFileSync(SKETCHFAB_DATA_PATH, 'utf8');
    sketchfabData = JSON.parse(rawData);
    console.log(`已讀取${sketchfabData.length}個現有模型數據`);
  } catch (error) {
    console.error('讀取數據文件時發生錯誤:', error);
    process.exit(1);
  }
} else {
  console.log('模型數據文件不存在，將創建新文件');
}

// 創建新模型
const modelId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const newModelData = {
  id: modelId,
  modelName: "NC220-M001 浴室模塊",
  description: "標準浴室模塊NC220-M001的3D模型",
  iframeCode: `<div class="sketchfab-embed-wrapper"> 
    <iframe title="Bathroom Module" frameborder="0" allowfullscreen mozallowfullscreen="true" 
      webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" 
      xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share 
      src="https://sketchfab.com/models/c405eb1186f64b47b9d801b1a73a3913/embed"> 
    </iframe> 
    <p style="font-size: 13px; font-weight: normal; margin: 5px; color: #4A4A4A;"> 
      <a href="https://sketchfab.com/3d-models/bathroom-module-c405eb1186f64b47b9d801b1a73a3913" 
        target="_blank" rel="nofollow" style="font-weight: bold; color: #1CAAD9;"> 
        Bathroom Module 
      </a> by 
      <a href="https://sketchfab.com/mic-models" target="_blank" rel="nofollow" 
        style="font-weight: bold; color: #1CAAD9;"> MiC Platform </a> on 
      <a href="https://sketchfab.com" target="_blank" rel="nofollow" 
        style="font-weight: bold; color: #1CAAD9;">Sketchfab</a>
    </p>
  </div>`,
  sketchfabUrl: "https://sketchfab.com/models/c405eb1186f64b47b9d801b1a73a3913/embed",
  sketchfabModelId: "c405eb1186f64b47b9d801b1a73a3913",
  extractedTitle: "Bathroom Module",
  projectId: "NC220",
  unitId: null,
  moduleId: "NC220-M001",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// 添加新模型
sketchfabData.push([modelId, newModelData]);

// 保存更新後的數據
try {
  fs.writeFileSync(SKETCHFAB_DATA_PATH, JSON.stringify(sketchfabData, null, 2), 'utf8');
  console.log(`成功添加新模型: ${newModelData.modelName}`);
  console.log(`更新後模型總數: ${sketchfabData.length}`);
} catch (error) {
  console.error('保存數據文件時發生錯誤:', error);
  process.exit(1);
} 