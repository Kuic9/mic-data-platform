const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { requirePermission } = require('../middleware/simple-auth');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Module = require('../models/Module');

const router = express.Router();

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/bulk');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, XLSX, and XLS files are allowed.'));
    }
  }
});

// 生成唯一ID
const generateId = (prefix) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}`;
};

// 解析CSV文件
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// 解析Excel文件
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  } catch (error) {
    throw new Error('Failed to parse Excel file');
  }
};

// 批量上传处理
router.post('/bulk', requirePermission('data_input'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { type } = req.body;
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    let data;
    
    // 根据文件类型解析数据
    if (ext === '.csv') {
      data = await parseCSV(filePath);
    } else if (ext === '.xlsx' || ext === '.xls') {
      data = parseExcel(filePath);
    } else {
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ message: 'No data found in file' });
    }

    let created = 0;
    let errors = [];

    // 根据类型处理数据
    for (const [index, row] of data.entries()) {
      try {
        if (type === 'projects' || !type) {
          // 处理项目数据
          const projectData = {
            project_id: row.project_id || generateId('PRJ'),
            project_name: row.project_name,
            location: row.location,
            total_units: parseInt(row.total_units) || 0,
            start_date: row.start_date || null,
            module_release_date: row.module_release_date || null,
            module_life_span: parseInt(row.module_life_span) || null,
            client: row.client || '',
            primary_structural_material: row.primary_structural_material || '',
            contractor: row.contractor || '',
            manufacturer: row.manufacturer || '',
            operator: row.operator || '',
            site_location: row.site_location || '',
            building_height: parseFloat(row.building_height) || null,
            num_floors: parseInt(row.num_floors) || null,
            unit_types: row.unit_types || '',
            total_modules: parseInt(row.total_modules) || null,
            structural_system: row.structural_system || '',
            other_actors: row.other_actors || '',
            ap_rec_rc: row.ap_rec_rc || '',
            project_status: row.project_status || 'Planning',
            description: row.description || '',
            image_url: row.image_url || ''
          };

          if (projectData.project_name && projectData.location) {
            await Project.create(projectData);
            created++;
          } else {
            errors.push(`Row ${index + 1}: Project name and location are required`);
          }

        } else if (type === 'units') {
          // 处理单元数据
          const unitData = {
            unit_id: row.unit_id,
            project_id: row.project_id,
            unit_type: row.unit_type || '',
            floor_level: parseInt(row.floor_level) || null,
            position: row.position || '',
            area: parseFloat(row.area) || null,
            num_modules: parseInt(row.num_modules) || null,
            completion_date: row.completion_date || null,
            status: row.status || 'Planning'
          };

          if (unitData.unit_id && unitData.project_id) {
            await Unit.create(unitData);
            created++;
          } else {
            errors.push(`Row ${index + 1}: Unit ID and Project ID are required`);
          }

        } else if (type === 'modules') {
          // 处理模块数据
          const moduleData = {
            module_id: row.module_id,
            unit_id: row.unit_id,
            module_type: row.module_type || '',
            manufacturer: row.manufacturer || '',
            major_material: row.major_material || '',
            intended_use: row.intended_use || '',
            status: row.status || 'Available',
            dimensions_length: parseFloat(row.dimensions_length) || null,
            dimensions_width: parseFloat(row.dimensions_width) || null,
            dimensions_height: parseFloat(row.dimensions_height) || null,
            weight: parseFloat(row.weight) || null,
            installation_date: row.installation_date || null,
            quality_grade: row.quality_grade || '',
            certification: row.certification || ''
          };

          if (moduleData.module_id && moduleData.unit_id) {
            await Module.create(moduleData);
            created++;
          } else {
            errors.push(`Row ${index + 1}: Module ID and Unit ID are required`);
          }
        }
      } catch (error) {
        errors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    // 清理上传的文件
    fs.unlinkSync(filePath);

    res.json({
      message: 'Bulk upload completed',
      created: created,
      total: data.length,
      errors: errors
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    
    // 清理上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      message: 'Failed to process upload',
      error: error.message 
    });
  }
});

// 下载模板文件
router.get('/templates/:type', requirePermission('data_input'), (req, res) => {
  const { type } = req.params;
  
  let templateData = [];
  let filename = '';

  switch (type) {
    case 'projects':
      templateData = [{
        project_id: 'PRJ_EXAMPLE_001',
        project_name: 'Sample Project',
        location: 'Hong Kong',
        total_units: 100,
        start_date: '2024-01-01',
        module_release_date: '2024-06-01',
        module_life_span: 50,
        client: 'Sample Client',
        primary_structural_material: 'Steel',
        contractor: 'Sample Contractor',
        manufacturer: 'Sample Manufacturer',
        operator: 'Sample Operator',
        site_location: 'Kowloon',
        building_height: 45.5,
        num_floors: 15,
        unit_types: '1BR, 2BR, 3BR',
        total_modules: 300,
        structural_system: 'Frame',
        other_actors: 'Consultants',
        ap_rec_rc: 'AP123456',
        project_status: 'Planning',
        description: 'Sample project description',
        image_url: 'https://example.com/image.jpg'
      }];
      filename = 'project_template.csv';
      break;

    case 'units':
      templateData = [{
        unit_id: 'UNIT_001',
        project_id: 'PRJ_EXAMPLE_001',
        unit_type: '2-Bedroom',
        floor_level: 5,
        position: 'A',
        area: 65.5,
        num_modules: 3,
        completion_date: '2024-12-01',
        status: 'Planning'
      }];
      filename = 'unit_template.csv';
      break;

    case 'modules':
      templateData = [{
        module_id: 'MOD_001',
        unit_id: 'UNIT_001',
        module_type: 'Bathroom',
        manufacturer: 'Sample Manufacturer',
        major_material: 'Steel',
        intended_use: 'Residential',
        status: 'Available',
        dimensions_length: 3000,
        dimensions_width: 2000,
        dimensions_height: 2700,
        weight: 1500.5,
        installation_date: '2024-08-01',
        quality_grade: 'A',
        certification: 'ISO9001'
      }];
      filename = 'module_template.csv';
      break;

    default:
      return res.status(400).json({ message: 'Invalid template type' });
  }

  // 转换为CSV格式
  const headers = Object.keys(templateData[0]);
  const csv = [
    headers.join(','),
    ...templateData.map(row => 
      headers.map(header => {
        const value = row[header];
        // 如果值包含逗号或引号，需要用引号包围
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(csv);
});

module.exports = router; 