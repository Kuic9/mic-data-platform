const express = require('express');
const { requirePermission, requireAnyPermission } = require('../middleware/simple-auth');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Module = require('../models/Module');
const ModuleAttribute = require('../models/ModuleAttribute');

const router = express.Router();

// 数据统计接口
router.get('/stats', requirePermission('read'), async (req, res) => {
  try {
    const [projects, units, modules] = await Promise.all([
      Project.findAll(),
      Unit.findAll(),
      Module.findAll()
    ]);

    const stats = {
      projects: {
        total: projects.length,
        byStatus: projects.reduce((acc, p) => {
          const status = p.project_status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      },
      units: {
        total: units.length,
        byType: units.reduce((acc, u) => {
          const type = u.unit_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      },
      modules: {
        total: modules.length,
        byType: modules.reduce((acc, m) => {
          const type = m.module_type || 'Unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byStatus: modules.reduce((acc, m) => {
          const status = m.status || 'Unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// 搜索接口 - 支持跨表搜索
router.get('/search', requirePermission('search'), async (req, res) => {
  try {
    const { query, type } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = {
      projects: [],
      units: [],
      modules: []
    };

    // 根据类型搜索或全局搜索
    if (!type || type === 'projects') {
      const projects = await Project.search(query);
      results.projects = projects.map(p => ({ ...p.toJSON(), _type: 'project' }));
    }

    if (!type || type === 'units') {
      const units = await Unit.search(query);
      results.units = units.map(u => ({ ...u.toJSON(), _type: 'unit' }));
    }

    if (!type || type === 'modules') {
      const modules = await Module.search(query);
      results.modules = modules.map(m => ({ ...m.toJSON(), _type: 'module' }));
    }

    // 如果没有指定类型，返回统一的结果集
    if (!type) {
      const allResults = [
        ...results.projects,
        ...results.units,
        ...results.modules
      ];
      return res.json({
        total: allResults.length,
        results: allResults
      });
    }

    res.json(results);
  } catch (error) {
    console.error('Error searching data:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// 批量操作接口
router.post('/batch', requireAnyPermission(['modify', 'data_input']), async (req, res) => {
  try {
    const { operation, type, items, data } = req.body;
    
    if (!operation || !type || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid batch request format' });
    }

    let results = [];
    let errors = [];

    for (const item of items) {
      try {
        let result;
        
        switch (operation) {
          case 'delete':
            if (req.user.hasPermission && !req.user.hasPermission('modify')) {
              throw new Error('Delete permission required');
            }
            result = await performDelete(type, item);
            break;
            
          case 'update':
            if (req.user.hasPermission && !req.user.hasPermission('modify')) {
              throw new Error('Modify permission required');
            }
            result = await performUpdate(type, item, data);
            break;
            
          case 'create':
            if (req.user.hasPermission && !req.user.hasPermission('data_input')) {
              throw new Error('Data input permission required');
            }
            result = await performCreate(type, { ...item, ...data });
            break;
            
          default:
            throw new Error(`Unsupported operation: ${operation}`);
        }
        
        results.push(result);
      } catch (error) {
        errors.push({
          item: item,
          error: error.message
        });
      }
    }

    res.json({
      success: results.length,
      failed: errors.length,
      results: results,
      errors: errors
    });

  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(500).json({ message: 'Batch operation failed' });
  }
});

// 辅助函数：执行删除操作
const performDelete = async (type, identifier) => {
  switch (type) {
    case 'project':
      const project = await Project.findByProjectId(identifier);
      if (!project) throw new Error(`Project ${identifier} not found`);
      await project.delete();
      return { id: identifier, status: 'deleted' };
      
    case 'unit':
      const unit = await Unit.findByUnitId(identifier);
      if (!unit) throw new Error(`Unit ${identifier} not found`);
      await unit.delete();
      return { id: identifier, status: 'deleted' };
      
    case 'module':
      const module = await Module.findByModuleId(identifier);
      if (!module) throw new Error(`Module ${identifier} not found`);
      await module.delete();
      return { id: identifier, status: 'deleted' };
      
    default:
      throw new Error(`Unsupported type for deletion: ${type}`);
  }
};

// 辅助函数：执行更新操作
const performUpdate = async (type, identifier, updateData) => {
  switch (type) {
    case 'project':
      const project = await Project.findByProjectId(identifier);
      if (!project) throw new Error(`Project ${identifier} not found`);
      await project.update(updateData);
      return { id: identifier, status: 'updated' };
      
    case 'unit':
      const unit = await Unit.findByUnitId(identifier);
      if (!unit) throw new Error(`Unit ${identifier} not found`);
      await unit.update(updateData);
      return { id: identifier, status: 'updated' };
      
    case 'module':
      const module = await Module.findByModuleId(identifier);
      if (!module) throw new Error(`Module ${identifier} not found`);
      await module.update(updateData);
      return { id: identifier, status: 'updated' };
      
    default:
      throw new Error(`Unsupported type for update: ${type}`);
  }
};

// 辅助函数：执行创建操作
const performCreate = async (type, data) => {
  switch (type) {
    case 'project':
      const project = await Project.create(data);
      return { id: project.projectId, status: 'created' };
      
    case 'unit':
      const unit = await Unit.create(data);
      return { id: unit.unitId, status: 'created' };
      
    case 'module':
      const module = await Module.create(data);
      return { id: module.moduleId, status: 'created' };
      
    default:
      throw new Error(`Unsupported type for creation: ${type}`);
  }
};

// 数据验证接口
router.post('/validate', requireAnyPermission(['modify', 'data_input']), async (req, res) => {
  try {
    const { type, data } = req.body;
    
    const validation = await validateData(type, data);
    
    res.json({
      valid: validation.valid,
      errors: validation.errors,
      warnings: validation.warnings
    });
    
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ message: 'Validation failed' });
  }
});

// 数据验证辅助函数
const validateData = async (type, data) => {
  const errors = [];
  const warnings = [];
  
  switch (type) {
    case 'project':
      if (!data.project_name) errors.push('Project name is required');
      if (!data.location) errors.push('Location is required');
      if (data.total_units && data.total_units < 0) errors.push('Total units must be positive');
      if (data.building_height && data.building_height < 0) errors.push('Building height must be positive');
      
      // 检查项目ID是否已存在
      if (data.project_id) {
        const existing = await Project.findByProjectId(data.project_id);
        if (existing) errors.push('Project ID already exists');
      }
      break;
      
    case 'unit':
      if (!data.unit_id) errors.push('Unit ID is required');
      if (!data.project_id) errors.push('Project ID is required');
      if (data.area && data.area < 0) errors.push('Area must be positive');
      
      // 检查项目是否存在
      if (data.project_id) {
        const project = await Project.findByProjectId(data.project_id);
        if (!project) errors.push('Referenced project does not exist');
      }
      break;
      
    case 'module':
      if (!data.module_id) errors.push('Module ID is required');
      if (!data.unit_id) errors.push('Unit ID is required');
      if (data.weight && data.weight < 0) errors.push('Weight must be positive');
      
      // 检查单元是否存在
      if (data.unit_id) {
        const unit = await Unit.findByUnitId(data.unit_id);
        if (!unit) errors.push('Referenced unit does not exist');
      }
      break;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

// 数据导出接口
router.get('/export/:type', requirePermission('read'), async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'json' } = req.query;
    
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'projects':
        const projects = await Project.findAll();
        data = projects.map(p => p.toJSON());
        filename = 'projects_export';
        break;
        
      case 'units':
        const units = await Unit.findAll();
        data = units.map(u => u.toJSON());
        filename = 'units_export';
        break;
        
      case 'modules':
        const modules = await Module.findAll();
        data = modules.map(m => m.toJSON());
        filename = 'modules_export';
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }
    
    if (format === 'csv') {
      if (data.length === 0) {
        return res.status(404).json({ message: 'No data to export' });
      }
      
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
      res.send(csv);
    } else {
      res.json({
        type: type,
        count: data.length,
        data: data,
        exported_at: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Export failed' });
  }
});

module.exports = router; 