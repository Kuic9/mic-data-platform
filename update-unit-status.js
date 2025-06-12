const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 數據庫文件路徑
const DB_PATH = path.join(__dirname, 'data/mic_platform.db');

console.log('更新南昌項目單元狀態...');

// 創建數據庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('已連接到數據庫');
});

// 更新所有南昌項目單元的狀態為"Occupied"
db.run(`
  UPDATE units 
  SET status = 'Occupied' 
  WHERE project_id = 'NC220'
`, function(err) {
  if (err) {
    console.error('Error updating unit status:', err);
  } else {
    console.log(`✅ 已更新 ${this.changes} 個單元的狀態為 "Occupied"`);
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