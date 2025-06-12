// 刪除NC220-M001模組的Sketchfab模型數據
const fs = require('fs');
const path = require('path');

// 配置文件路徑
const SKETCHFAB_DATA_PATH = path.join(__dirname, 'data', 'sketchfab_embeds.json');

// 確認文件是否存在
if (!fs.existsSync(SKETCHFAB_DATA_PATH)) {
  console.error('錯誤：Sketchfab數據文件不存在！');
  process.exit(1);
}

// 讀取現有數據
try {
  console.log('讀取Sketchfab模型數據...');
  const rawData = fs.readFileSync(SKETCHFAB_DATA_PATH, 'utf8');
  const sketchfabData = JSON.parse(rawData);
  
  // 在刪除前統計模型數量
  console.log(`原始模型總數: ${sketchfabData.length}`);
  
  // 找出與NC220-M001相關的模型
  const nc220M001Models = sketchfabData.filter(item => {
    // 檢查每個項目的結構 - 應該是 [id, data] 格式
    if (Array.isArray(item) && item.length === 2 && item[1].moduleId) {
      return item[1].moduleId === 'NC220-M001';
    }
    return false;
  });
  
  console.log(`找到NC220-M001模組相關模型: ${nc220M001Models.length}個`);
  nc220M001Models.forEach(item => {
    const [id, data] = item;
    console.log(`  - ${id}: ${data.modelName}`);
  });
  
  // 過濾掉NC220-M001相關的模型
  const updatedData = sketchfabData.filter(item => {
    if (Array.isArray(item) && item.length === 2 && item[1].moduleId) {
      return item[1].moduleId !== 'NC220-M001';
    }
    return true; // 保留任何不符合預期格式的項目
  });
  
  // 保存更新後的數據
  fs.writeFileSync(SKETCHFAB_DATA_PATH, JSON.stringify(updatedData, null, 2), 'utf8');
  
  console.log(`更新完成！刪除了${sketchfabData.length - updatedData.length}個模型`);
  console.log(`現在模型總數: ${updatedData.length}`);

} catch (error) {
  console.error('處理Sketchfab數據時發生錯誤:', error);
  console.error(error.stack);
  process.exit(1);
} 