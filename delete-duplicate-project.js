const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 數據庫文件路徑
const DB_PATH = path.join(__dirname, 'data/mic_platform.db');

console.log('檢查並刪除重複的Nam Cheong項目...');

// 創建數據庫連接
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    return;
  }
  console.log('已連接到數據庫');
});

// 查找所有Nam Cheong項目
db.all(`
  SELECT * FROM projects 
  WHERE project_name LIKE 'Nam Cheong%'
  ORDER BY id
`, (err, projects) => {
  if (err) {
    console.error('Error querying projects:', err);
    db.close();
    return;
  }

  console.log(`找到 ${projects.length} 個Nam Cheong項目:`);
  projects.forEach((project, index) => {
    console.log(`${index + 1}. ID: ${project.id}, 項目ID: ${project.project_id}, 名稱: ${project.project_name}`);
  });

  // 如果找到多個項目，保留NC220，刪除其他的
  if (projects.length > 1) {
    // 找到NC220項目
    const nc220Project = projects.find(p => p.project_id === 'NC220');
    
    if (nc220Project) {
      console.log('\n保留項目:');
      console.log(`ID: ${nc220Project.id}, 項目ID: ${nc220Project.project_id}, 名稱: ${nc220Project.project_name}`);
      
      // 獲取要刪除的項目ID列表
      const projectIdsToDelete = projects
        .filter(p => p.project_id !== 'NC220')
        .map(p => p.project_id);
      
      if (projectIdsToDelete.length === 0) {
        console.log('沒有需要刪除的重複項目');
        db.close();
        return;
      }
      
      console.log('\n將刪除以下項目:');
      projectIdsToDelete.forEach(id => {
        const project = projects.find(p => p.project_id === id);
        console.log(`ID: ${project.id}, 項目ID: ${project.project_id}, 名稱: ${project.project_name}`);
      });
      
      // 開始事務
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // 刪除相關的單元和模塊
        projectIdsToDelete.forEach(projectId => {
          // 獲取相關單元
          db.all(`SELECT unit_id FROM units WHERE project_id = ?`, [projectId], (err, units) => {
            if (err) {
              console.error(`Error getting units for project ${projectId}:`, err);
              return;
            }
            
            const unitIds = units.map(u => u.unit_id);
            
            // 刪除相關模塊
            if (unitIds.length > 0) {
              const placeholders = unitIds.map(() => '?').join(',');
              db.run(`DELETE FROM modules WHERE unit_id IN (${placeholders})`, unitIds, function(err) {
                if (err) {
                  console.error(`Error deleting modules for project ${projectId}:`, err);
                } else {
                  console.log(`已刪除 ${this.changes} 個相關模塊`);
                }
              });
            }
            
            // 刪除單元
            db.run(`DELETE FROM units WHERE project_id = ?`, [projectId], function(err) {
              if (err) {
                console.error(`Error deleting units for project ${projectId}:`, err);
              } else {
                console.log(`已刪除 ${this.changes} 個相關單元`);
              }
            });
          });
          
          // 刪除項目
          db.run(`DELETE FROM projects WHERE project_id = ?`, [projectId], function(err) {
            if (err) {
              console.error(`Error deleting project ${projectId}:`, err);
            } else {
              console.log(`已刪除項目 ${projectId}`);
            }
          });
        });
        
        // 提交事務
        db.run('COMMIT', (err) => {
          if (err) {
            console.error('Error committing transaction:', err);
            db.run('ROLLBACK');
          } else {
            console.log('\n成功刪除重複項目');
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
    } else {
      console.log('未找到NC220項目，無法確定要保留哪個項目');
      db.close();
    }
  } else {
    console.log('沒有重複的Nam Cheong項目需要刪除');
    db.close();
  }
}); 