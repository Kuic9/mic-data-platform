const { db } = require('../config/database');

class Project {
  constructor(projectData) {
    this.id = projectData.id;
    this.projectId = projectData.project_id;
    this.projectName = projectData.project_name;
    this.location = projectData.location;
    this.totalUnits = projectData.total_units;
    this.startDate = projectData.start_date;
    this.moduleReleaseDate = projectData.module_release_date;
    this.moduleLifeSpan = projectData.module_life_span;
    this.client = projectData.client;
    this.primaryStructuralMaterial = projectData.primary_structural_material;
    this.contractor = projectData.contractor;
    this.manufacturer = projectData.manufacturer;
    this.operator = projectData.operator;
    this.siteLocation = projectData.site_location;
    this.buildingHeight = projectData.building_height;
    this.numFloors = projectData.num_floors;
    this.unitTypes = projectData.unit_types;
    this.totalModules = projectData.total_modules;
    this.structuralSystem = projectData.structural_system;
    this.otherActors = projectData.other_actors;
    this.apRecRc = projectData.ap_rec_rc;
    this.projectStatus = projectData.project_status;
    this.description = projectData.description;
    this.imageUrl = projectData.image_url;
    this.createdAt = projectData.created_at;
    this.updatedAt = projectData.updated_at;
  }

  // 創建新項目
  static async create(projectData) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO projects (
          project_id, project_name, location, total_units, start_date, module_release_date,
          module_life_span, client, primary_structural_material, contractor, manufacturer,
          operator, site_location, building_height, num_floors, unit_types, total_modules,
          structural_system, other_actors, ap_rec_rc, project_status, description, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        projectData.project_id,
        projectData.project_name,
        projectData.location,
        projectData.total_units,
        projectData.start_date,
        projectData.module_release_date,
        projectData.module_life_span,
        projectData.client,
        projectData.primary_structural_material,
        projectData.contractor,
        projectData.manufacturer,
        projectData.operator,
        projectData.site_location,
        projectData.building_height,
        projectData.num_floors,
        projectData.unit_types,
        projectData.total_modules,
        projectData.structural_system,
        projectData.other_actors,
        projectData.ap_rec_rc,
        projectData.project_status,
        projectData.description,
        projectData.image_url
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          Project.findById(this.lastID)
            .then(project => resolve(project))
            .catch(err => reject(err));
        }
      });

      stmt.finalize();
    });
  }

  // 根據ID查找項目
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Project(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 根據項目ID查找項目
  static async findByProjectId(projectId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM projects WHERE project_id = ?', [projectId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Project(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // 獲取所有項目
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM projects ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const projects = rows.map(row => new Project(row));
          resolve(projects);
        }
      });
    });
  }

  // 搜索項目
  static async search(searchQuery) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM projects 
        WHERE project_id LIKE ? 
           OR project_name LIKE ? 
           OR location LIKE ? 
           OR client LIKE ?
           OR contractor LIKE ?
           OR manufacturer LIKE ?
           OR project_status LIKE ?
        ORDER BY created_at DESC
      `;
      
      const searchTerm = `%${searchQuery}%`;
      const params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const projects = rows.map(row => new Project(row));
          resolve(projects);
        }
      });
    });
  }

  // 更新項目
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

      const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;

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

  // 刪除項目
  async delete() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM projects WHERE id = ?', [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // 獲取項目的所有單元
  async getUnits() {
    const Unit = require('./Unit');
    return Unit.findByProjectId(this.projectId);
  }

  // 轉換為JSON格式
  toJSON() {
    return {
      project_id: this.projectId,
      project_name: this.projectName,
      location: this.location,
      total_units: this.totalUnits,
      start_date: this.startDate,
      module_release_date: this.moduleReleaseDate,
      module_life_span: this.moduleLifeSpan,
      client: this.client,
      primary_structural_material: this.primaryStructuralMaterial,
      contractor: this.contractor,
      manufacturer: this.manufacturer,
      operator: this.operator,
      site_location: this.siteLocation,
      building_height: this.buildingHeight,
      num_floors: this.numFloors,
      unit_types: this.unitTypes,
      total_modules: this.totalModules,
      structural_system: this.structuralSystem,
      other_actors: this.otherActors,
      ap_rec_rc: this.apRecRc,
      project_status: this.projectStatus,
      description: this.description,
      image_url: this.imageUrl
    };
  }
}

module.exports = Project; 