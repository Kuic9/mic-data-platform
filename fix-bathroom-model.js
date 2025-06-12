// 修復浴室模型關聯的腳本
const fs = require('fs');
const path = require('path');

// 配置
const EMBED_JSON_PATH = path.join(__dirname, 'data', 'sketchfab_embeds.json');
const MODULE_ID_TO_FIX = 'NC220-M001'; // 浴室模型所屬的模塊ID
const MODEL_NAME = 'Bathroom';

// 主函數
async function fixBathroomModel() {
  console.log('🛠️ 開始修復浴室模型關聯...');
  
  try {
    // 檢查文件是否存在
    if (!fs.existsSync(EMBED_JSON_PATH)) {
      console.error(`❌ 錯誤: 模型數據文件不存在 (${EMBED_JSON_PATH})`);
      return;
    }
    
    // 讀取並解析數據
    const content = fs.readFileSync(EMBED_JSON_PATH, 'utf8');
    const arr = JSON.parse(content);
    console.log(`📊 已載入${arr.length}個模型數據條目`);
    
    // 檢查是否有浴室模型
    const bathroomModelIndex = arr.findIndex(([id, model]) => model.modelName === MODEL_NAME);
    
    if (bathroomModelIndex === -1) {
      console.error(`❌ 錯誤: 找不到名為"${MODEL_NAME}"的模型`);
      return;
    }
    
    const bathroomModelId = arr[bathroomModelIndex][0];
    const bathroomModelData = arr[bathroomModelIndex][1];
    
    console.log(`👉 找到浴室模型: ${bathroomModelId}`);
    console.log(`   模型名稱: ${bathroomModelData.modelName}`);
    console.log(`   當前關聯到: moduleId=${bathroomModelData.moduleId || '無'}, unitId=${bathroomModelData.unitId || '無'}`);
    
    // 修復關聯
    if (bathroomModelData.moduleId !== MODULE_ID_TO_FIX) {
      console.log(`🔄 更新模型關聯為模塊 ${MODULE_ID_TO_FIX}...`);
      bathroomModelData.moduleId = MODULE_ID_TO_FIX;
      arr[bathroomModelIndex][1] = bathroomModelData;
      
      // 保存更新
      fs.writeFileSync(EMBED_JSON_PATH, JSON.stringify(arr, null, 2), 'utf8');
      console.log('✅ 成功更新模型關聯!');
    } else {
      console.log('✓ 浴室模型已經正確關聯到目標模塊，無需修改');
    }
  } catch (error) {
    console.error('❌ 修復過程中出錯:', error);
  }
}

// 執行主函數
fixBathroomModel(); 