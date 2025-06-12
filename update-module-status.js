const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 數據庫文件路徑
const DB_PATH = path.join(__dirname, 'data/mic_platform.db');

console.log('更新模塊狀態...');

// 創建數據庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('已連接到數據庫');
});

// 定義不同模塊的狀態
const moduleStatuses = {
  'NC220-M001': 'Active',      // 浴室模塊 - 活躍狀態
  'NC220-M002': 'In Use',      // 客廳模塊 - 使用中
  'NC220-M003': 'In Use',      // 浴室模塊 - 使用中
  'NC220-M004': 'Maintenance', // 客廳模塊 - 維護中
  'NC220-M005': 'Active',      // 浴室模塊 - 活躍狀態
  'NC220-M006': 'Maintenance'  // 客廳模塊 - 維護中
};

// 開始事務
db.serialize(() => {
  db.run('BEGIN TRANSACTION');
  
  // 更新每個模塊的狀態
  const stmt = db.prepare('UPDATE modules SET status = ? WHERE module_id = ?');
  
  let updatedCount = 0;
  
  // 執行每個模塊的狀態更新
  Object.entries(moduleStatuses).forEach(([moduleId, status]) => {
    stmt.run(status, moduleId, function(err) {
      if (err) {
        console.error(`Error updating status for module ${moduleId}:`, err);
      } else if (this.changes > 0) {
        console.log(`✅ 更新模塊 ${moduleId} 狀態為 ${status}`);
        updatedCount++;
      } else {
        console.log(`⚠️ 未找到模塊 ${moduleId}`);
      }
    });
  });
  
  stmt.finalize();
  
  // 提交事務
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction:', err);
      db.run('ROLLBACK');
      console.log('交易已回滾');
    } else {
      console.log(`\n成功更新 ${updatedCount} 個模塊狀態`);
    }
    
    // 關閉數據庫連接
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('數據庫連接已關閉');
      }
    });
  });
}); 