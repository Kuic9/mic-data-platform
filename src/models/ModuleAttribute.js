const { db } = require('../config/database');

class ModuleAttribute {
  constructor(attributeData) {
    this.id = attributeData.id;
    this.moduleId = attributeData.module_id;
    this.attributeName = attributeData.attribute_name;
    this.attributeValue = attributeData.attribute_value;
    this.attributeType = attributeData.attribute_type;
    this.createdAt = attributeData.created_at;
  }

  // 創建新模塊屬性
  static async create(attributeData) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO module_attributes (module_id, attribute_name, attribute_value, attribute_type)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run([
        attributeData.module_id,
        attributeData.attribute_name,
        attributeData.attribute_value,
        attributeData.attribute_type
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          ModuleAttribute.findById(this.lastID)
            .then(attribute => resolve(attribute))
            .catch(err => reject(err));
        }
      });

      stmt.finalize();
    });
  }

  // 根據ID查找模塊屬性
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM module_attributes WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new ModuleAttribute(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據模塊ID查找所有屬性
  static async findByModuleId(moduleId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM module_attributes WHERE module_id = ? ORDER BY attribute_name', [moduleId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const attributes = rows.map(row => new ModuleAttribute(row));
          resolve(attributes);
        }
      });
    });
  }

  // 批量創建模塊屬性
  static async createBatch(moduleId, attributes) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO module_attributes (module_id, attribute_name, attribute_value, attribute_type)
        VALUES (?, ?, ?, ?)
      `);

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        let completed = 0;
        let hasError = false;

        attributes.forEach(attr => {
          stmt.run([moduleId, attr.attribute_name, attr.attribute_value, attr.attribute_type], (err) => {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            completed++;
            if (completed === attributes.length && !hasError) {
              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(true);
                }
              });
            }
          });
        });

        stmt.finalize();
      });
    });
  }

  // 更新模塊屬性
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

      values.push(this.id);
      const query = `UPDATE module_attributes SET ${fields.join(', ')} WHERE id = ?`;

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

  // 刪除模塊屬性
  async delete() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM module_attributes WHERE id = ?', [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 根據模塊ID刪除所有屬性
  static async deleteByModuleId(moduleId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM module_attributes WHERE module_id = ?', [moduleId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 轉換為JSON格式
  toJSON() {
    return {
      id: this.id,
      attribute_name: this.attributeName,
      attribute_value: this.attributeValue,
      attribute_type: this.attributeType
    };
  }
}

module.exports = ModuleAttribute; 