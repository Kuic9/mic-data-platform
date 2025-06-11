const { db } = require('../config/database');

class Unit {
  constructor(unitData) {
    this.id = unitData.id;
    this.unit_id = unitData.unit_id;
    this.project_id = unitData.project_id;
    this.unit_type = unitData.unit_type;
    this.floor_level = unitData.floor_level;
    this.position = unitData.position;
    this.area = unitData.area;
    this.num_modules = unitData.num_modules;
    this.completion_date = unitData.completion_date;
    this.status = unitData.status;
    // Legacy fields for backward compatibility
    this.locationInProject = unitData.location_in_project;
    this.temporalLocation = unitData.temporal_location;
    this.intendedUse = unitData.intended_use;
    this.spatialDesign = unitData.spatial_design;
    this.facilities = unitData.facilities;
    this.mepSystems = unitData.mep_systems;
    this.connections = unitData.connections;
    this.standardDetails = unitData.standard_details;
    this.moduleConditions = unitData.module_conditions;
    this.workMethods = unitData.work_methods;
    this.dfsConcerns = unitData.dfs_concerns;
    this.floorNumber = unitData.floor_number;
    this.unitNumber = unitData.unit_number;
    this.bedrooms = unitData.bedrooms;
    this.bathrooms = unitData.bathrooms;
    this.createdAt = unitData.created_at;
    this.updatedAt = unitData.updated_at;
  }

  // 創建新單元
  static async create(unitData) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO units (
          unit_id, project_id, unit_type, floor_level, position, area, 
          num_modules, completion_date, status, location_in_project, 
          temporal_location, intended_use, spatial_design, facilities, 
          mep_systems, connections, standard_details, module_conditions, 
          work_methods, dfs_concerns, floor_number, unit_number, 
          bedrooms, bathrooms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        unitData.unit_id,
        unitData.project_id,
        unitData.unit_type,
        unitData.floor_level,
        unitData.position,
        unitData.area,
        unitData.num_modules,
        unitData.completion_date,
        unitData.status || 'Planning',
        unitData.location_in_project,
        unitData.temporal_location,
        unitData.intended_use,
        unitData.spatial_design,
        unitData.facilities,
        unitData.mep_systems,
        unitData.connections,
        unitData.standard_details,
        unitData.module_conditions,
        unitData.work_methods,
        unitData.dfs_concerns,
        unitData.floor_number,
        unitData.unit_number,
        unitData.bedrooms,
        unitData.bathrooms
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          Unit.findById(this.lastID)
            .then(unit => resolve(unit))
            .catch(err => reject(err));
        }
      });

      stmt.finalize();
    });
  }

  // 根據ID查找單元
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM units WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Unit(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據單元ID查找單元
  static async findByUnitId(unitId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM units WHERE unit_id = ?', [unitId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Unit(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據項目ID查找所有單元
  static async findByProjectId(projectId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM units WHERE project_id = ? ORDER BY floor_number, unit_number', [projectId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const units = rows.map(row => new Unit(row));
          resolve(units);
        }
      });
    });
  }

  // 獲取所有單元
  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM units';
      let params = [];
      
      if (Object.keys(filters).length > 0) {
        const conditions = [];
        Object.keys(filters).forEach(key => {
          conditions.push(`${key} = ?`);
          params.push(filters[key]);
        });
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const units = rows.map(row => new Unit(row));
          resolve(units);
        }
      });
    });
  }

  // 搜索單元
  static async search(searchQuery) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM units 
        WHERE unit_id LIKE ? 
           OR project_id LIKE ? 
           OR intended_use LIKE ? 
           OR status LIKE ?
        ORDER BY created_at DESC
      `;
      
      const searchTerm = `%${searchQuery}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm];

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const units = rows.map(row => new Unit(row));
          resolve(units);
        }
      });
    });
  }

  // 更新單元
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

      const query = `UPDATE units SET ${fields.join(', ')} WHERE id = ?`;

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

  // 刪除單元
  async delete() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM units WHERE id = ?', [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 獲取單元的所有模塊
  async getModules() {
    const Module = require('./Module');
    return Module.findByUnitId(this.unitId);
  }

  // 轉換為JSON格式
  toJSON() {
    return {
      unit_id: this.unit_id,
      project_id: this.project_id,
      unit_type: this.unit_type,
      floor_level: this.floor_level,
      position: this.position,
      area: this.area,
      num_modules: this.num_modules,
      completion_date: this.completion_date,
      status: this.status,
      location_in_project: this.locationInProject,
      temporal_location: this.temporalLocation,
      intended_use: this.intendedUse,
      spatial_design: this.spatialDesign,
      facilities: this.facilities,
      mep_systems: this.mepSystems,
      connections: this.connections,
      standard_details: this.standardDetails,
      module_conditions: this.moduleConditions,
      work_methods: this.workMethods,
      dfs_concerns: this.dfsConcerns,
      floor_number: this.floorNumber,
      unit_number: this.unitNumber,
      bedrooms: this.bedrooms,
      bathrooms: this.bathrooms,
      created_at: this.createdAt,
      updated_at: this.updatedAt
    };
  }
}

module.exports = Unit; 