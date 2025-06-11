const { db } = require('../config/database');

class Module {
  constructor(moduleData) {
    this.id = moduleData.id;
    this.moduleId = moduleData.module_id;
    this.unitId = moduleData.unit_id;
    this.moduleType = moduleData.module_type;
    this.manufacturer = moduleData.manufacturer;
    this.majorMaterial = moduleData.major_material;
    this.intendedUse = moduleData.intended_use;
    this.status = moduleData.status;
    this.dimensionsLength = moduleData.dimensions_length;
    this.dimensionsWidth = moduleData.dimensions_width;
    this.dimensionsHeight = moduleData.dimensions_height;
    this.weight = moduleData.weight;
    this.installationDate = moduleData.installation_date;
    this.qualityGrade = moduleData.quality_grade;
    this.certification = moduleData.certification;
    this.createdAt = moduleData.created_at;
    this.updatedAt = moduleData.updated_at;
  }

  // 創建新模塊
  static async create(moduleData) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO modules (
          module_id, unit_id, module_type, manufacturer, major_material, intended_use,
          status, dimensions_length, dimensions_width, dimensions_height, weight,
          installation_date, quality_grade, certification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        moduleData.module_id,
        moduleData.unit_id,
        moduleData.module_type,
        moduleData.manufacturer,
        moduleData.major_material,
        moduleData.intended_use,
        moduleData.status,
        moduleData.dimensions_length,
        moduleData.dimensions_width,
        moduleData.dimensions_height,
        moduleData.weight,
        moduleData.installation_date,
        moduleData.quality_grade,
        moduleData.certification
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          Module.findById(this.lastID)
            .then(module => resolve(module))
            .catch(err => reject(err));
        }
      });

      stmt.finalize();
    });
  }

  // 根據ID查找模塊
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM modules WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Module(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據模塊ID查找模塊
  static async findByModuleId(moduleId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM modules WHERE module_id = ?', [moduleId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Module(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據單元ID查找所有模塊
  static async findByUnitId(unitId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM modules WHERE unit_id = ? ORDER BY created_at', [unitId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const modules = rows.map(row => new Module(row));
          resolve(modules);
        }
      });
    });
  }

  // 獲取所有模塊（支持篩選）
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM modules WHERE 1=1';
      const params = [];

      // 添加篩選條件
      if (filters.module_type) {
        query += ' AND module_type = ?';
        params.push(filters.module_type);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.major_material) {
        query += ' AND major_material = ?';
        params.push(filters.major_material);
      }

      if (filters.intended_use) {
        query += ' AND intended_use = ?';
        params.push(filters.intended_use);
      }

      query += ' ORDER BY created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const modules = rows.map(row => new Module(row));
          resolve(modules);
        }
      });
    });
  }

  // 搜索模塊
  static async search(searchQuery) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM modules 
        WHERE module_id LIKE ? 
           OR module_type LIKE ? 
           OR manufacturer LIKE ? 
           OR major_material LIKE ? 
           OR intended_use LIKE ?
        ORDER BY created_at DESC
      `;
      
      const searchTerm = `%${searchQuery}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const modules = rows.map(row => new Module(row));
          resolve(modules);
        }
      });
    });
  }

  // 更新模塊
  async update(updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      // 構建動態更新查詢
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return resolve(this);
      }

      // 添加更新時間
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);

      const query = `UPDATE modules SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          // 更新當前實例的屬性
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // 刪除模塊
  async delete() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM modules WHERE id = ?', [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 獲取模塊的所有屬性
  async getAttributes() {
    const ModuleAttribute = require('./ModuleAttribute');
    return ModuleAttribute.findByModuleId(this.moduleId);
  }

  // 轉換為JSON格式
  toJSON() {
    return {
      module_id: this.moduleId,
      unit_id: this.unitId,
      module_type: this.moduleType,
      manufacturer: this.manufacturer,
      major_material: this.majorMaterial,
      intended_use: this.intendedUse,
      status: this.status,
      dimensions_length: this.dimensionsLength,
      dimensions_width: this.dimensionsWidth,
      dimensions_height: this.dimensionsHeight,
      weight: this.weight,
      installation_date: this.installationDate,
      quality_grade: this.qualityGrade,
      certification: this.certification,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = Module; 