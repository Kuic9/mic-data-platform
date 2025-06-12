const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 數據庫文件路徑
const DB_PATH = path.join(__dirname, 'data/mic_platform.db');
const SKETCHFAB_DATA_PATH = path.join(__dirname, 'data/sketchfab_embeds.json');

console.log('驗證Nam Cheong項目數據...\n');

// 創建數據庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
});

db.serialize(() => {
  // 1. 檢查項目數據
  console.log('=== 項目信息 ===');
  db.get(`SELECT * FROM projects WHERE project_id = 'NC220'`, (err, row) => {
    if (err) {
      console.error('Error querying projects:', err);
    } else if (row) {
      console.log(`項目名稱: ${row.project_name}`);
      console.log(`位置: ${row.location}`);
      console.log(`總單元數: ${row.total_units}`);
      console.log(`戶型: ${row.unit_types}`);
      console.log(`狀態: ${row.project_status}`);
      console.log(`描述: ${row.description}`);
    } else {
      console.log('未找到NC220項目');
    }
    console.log('');
  });

  // 2. 檢查單元數據
  console.log('=== 單元信息 ===');
  db.all(`SELECT * FROM units WHERE project_id = 'NC220' ORDER BY unit_id`, (err, rows) => {
    if (err) {
      console.error('Error querying units:', err);
    } else {
      rows.forEach((unit, index) => {
        console.log(`${index + 1}. ${unit.unit_type}`);
        console.log(`   單元ID: ${unit.unit_id}`);
        console.log(`   位置: ${unit.position}`);
        console.log(`   面積: ${unit.area}m²`);
        console.log(`   房間數: ${unit.bedrooms}房${unit.bathrooms}衛`);
        console.log(`   模塊數量: ${unit.num_modules}`);
        console.log(`   設施: ${unit.facilities}`);
        console.log('');
      });
    }
  });

  // 3. 檢查模塊數據
  console.log('=== 模塊信息 ===');
  db.all(`
    SELECT m.*, u.unit_type 
    FROM modules m 
    JOIN units u ON m.unit_id = u.unit_id 
    WHERE u.project_id = 'NC220' 
    ORDER BY m.unit_id, m.module_type
  `, (err, rows) => {
    if (err) {
      console.error('Error querying modules:', err);
    } else {
      let currentUnit = '';
      rows.forEach((module) => {
        if (module.unit_id !== currentUnit) {
          currentUnit = module.unit_id;
          console.log(`--- ${module.unit_type} (${module.unit_id}) ---`);
        }
        console.log(`  ${module.module_type}模塊 (${module.module_id})`);
        console.log(`    尺寸: ${module.dimensions_length}×${module.dimensions_width}×${module.dimensions_height}m`);
        console.log(`    重量: ${module.weight}kg`);
        console.log(`    用途: ${module.intended_use}`);
        console.log('');
      });
    }
  });

  // 4. 檢查Sketchfab數據
  setTimeout(() => {
    console.log('=== Sketchfab模型數據 ===');
    if (fs.existsSync(SKETCHFAB_DATA_PATH)) {
      const rawData = fs.readFileSync(SKETCHFAB_DATA_PATH, 'utf8');
      const sketchfabData = JSON.parse(rawData);
      
      const nc220Models = sketchfabData.filter(([id, data]) => 
        data.projectId === 'NC220' || data.moduleId?.startsWith('NC220')
      );
      
      console.log(`NC220項目相關模型數量: ${nc220Models.length}`);
      nc220Models.forEach(([id, data]) => {
        console.log(`  - ${data.modelName}`);
        console.log(`    關聯: ${data.unitId ? `單元 ${data.unitId}` : `模塊 ${data.moduleId}`}`);
        console.log(`    Sketchfab ID: ${data.sketchfabModelId}`);
        console.log('');
      });
    }

    // 關閉數據庫連接
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('驗證完成！');
      }
    });
  }, 1000);
}); 