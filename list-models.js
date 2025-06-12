// 列出所有模型關聯的腳本
const fs = require('fs');
const path = require('path');

// 配置
const EMBED_JSON_PATH = path.join(__dirname, 'data', 'sketchfab_embeds.json');

// 格式化日期時間
function formatDateTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return isoString || '未知時間';
  }
}

// 主函數
async function listAllModels() {
  console.log('📋 列出所有Sketchfab模型數據...');
  
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
    
    if (arr.length === 0) {
      console.log('⚠️ 沒有找到任何模型數據');
      return;
    }
    
    // 輸出所有模型信息
    console.log('\n === 模型列表 === ');
    console.log('+---------+------------------+------------------+------------------+--------------------+');
    console.log('| 序號    | 模型名稱         | 模塊ID           | 單元ID           | 創建時間           |');
    console.log('+---------+------------------+------------------+------------------+--------------------+');
    
    arr.forEach(([id, model], index) => {
      const num = (index + 1).toString().padEnd(7);
      const name = (model.modelName || '未命名').padEnd(16);
      const moduleId = (model.moduleId || '-').padEnd(16);
      const unitId = (model.unitId || '-').padEnd(16);
      const createdAt = formatDateTime(model.createdAt);
      
      console.log(`| ${num} | ${name} | ${moduleId} | ${unitId} | ${createdAt} |`);
    });
    
    console.log('+---------+------------------+------------------+------------------+--------------------+');
    console.log(`\n總計: ${arr.length}個模型\n`);
    
    // 檢查潛在問題
    const noModuleIds = arr.filter(([_, model]) => !model.moduleId && !model.unitId);
    if (noModuleIds.length > 0) {
      console.log(`⚠️ 警告: 有${noModuleIds.length}個模型沒有關聯到任何模塊或單元`);
      noModuleIds.forEach(([id, model]) => {
        console.log(`  - ${model.modelName || '未命名'} (ID: ${id})`);
      });
    }
    
    // 檢查重複名稱
    const nameCount = {};
    arr.forEach(([_, model]) => {
      const name = model.modelName || '未命名';
      nameCount[name] = (nameCount[name] || 0) + 1;
    });
    
    const duplicateNames = Object.entries(nameCount)
      .filter(([_, count]) => count > 1);
    
    if (duplicateNames.length > 0) {
      console.log(`\n⚠️ 警告: 有${duplicateNames.length}個模型名稱重複使用`);
      duplicateNames.forEach(([name, count]) => {
        console.log(`  - "${name}" 使用了 ${count} 次`);
      });
    }
    
  } catch (error) {
    console.error('❌ 執行過程中出錯:', error);
  }
}

// 執行主函數
listAllModels(); 