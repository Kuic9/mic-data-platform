const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 數據庫文件路徑
const DB_PATH = path.join(__dirname, 'data/mic_platform.db');

console.log('重置數據庫...');

// 刪除現有數據庫文件
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('已刪除現有數據庫文件');
}

// 創建新的數據庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
  } else {
    console.log('已創建新的數據庫');
  }
});

// 初始化數據庫表結構
db.serialize(() => {
  // 創建用戶表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'supplier',
      full_name TEXT NOT NULL,
      organization TEXT NOT NULL,
      phone_number TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('用戶表創建成功');
  });

  // 創建項目表
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT UNIQUE NOT NULL,
      project_name TEXT NOT NULL,
      location TEXT,
      total_units INTEGER,
      start_date TEXT,
      module_release_date TEXT,
      module_life_span INTEGER,
      client TEXT,
      primary_structural_material TEXT,
      contractor TEXT,
      manufacturer TEXT,
      operator TEXT,
      site_location TEXT,
      building_height TEXT,
      num_floors INTEGER,
      unit_types TEXT,
      total_modules INTEGER,
      structural_system TEXT,
      other_actors TEXT,
      ap_rec_rc TEXT,
      project_status TEXT,
      description TEXT,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating projects table:', err);
    else console.log('項目表創建成功');
  });

  // 創建單元表 - 新結構
  db.run(`
    CREATE TABLE IF NOT EXISTS units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_id TEXT UNIQUE NOT NULL,
      project_id TEXT NOT NULL,
      unit_type TEXT,
      floor_level INTEGER,
      position TEXT,
      area REAL,
      num_modules INTEGER,
      completion_date TEXT,
      status TEXT DEFAULT 'Planning',
      location_in_project TEXT,
      temporal_location TEXT,
      intended_use TEXT,
      spatial_design TEXT,
      facilities TEXT,
      mep_systems TEXT,
      connections TEXT,
      standard_details TEXT,
      module_conditions TEXT,
      work_methods TEXT,
      dfs_concerns TEXT,
      floor_number INTEGER,
      unit_number TEXT,
      bedrooms INTEGER,
      bathrooms INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (project_id)
    )
  `, (err) => {
    if (err) console.error('Error creating units table:', err);
    else console.log('單元表創建成功');
  });

  // 創建模塊表
  db.run(`
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id TEXT UNIQUE NOT NULL,
      unit_id TEXT NOT NULL,
      module_type TEXT,
      manufacturer TEXT,
      major_material TEXT,
      intended_use TEXT,
      status TEXT,
      dimensions_length REAL,
      dimensions_width REAL,
      dimensions_height REAL,
      weight REAL,
      installation_date TEXT,
      quality_grade TEXT,
      certification TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES units (unit_id)
    )
  `, (err) => {
    if (err) console.error('Error creating modules table:', err);
    else console.log('模塊表創建成功');
  });

  // 創建模塊屬性表
  db.run(`
    CREATE TABLE IF NOT EXISTS module_attributes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id TEXT NOT NULL,
      attribute_name TEXT NOT NULL,
      attribute_value TEXT,
      attribute_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES modules (module_id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating module_attributes table:', err);
    } else {
      console.log('模塊屬性表創建成功');
      console.log('數據庫重置完成！');
      
      // 關閉數據庫連接
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('數據庫連接已關閉');
        }
      });
    }
  });
}); 