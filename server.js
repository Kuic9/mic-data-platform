const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Import database configuration and models
const { initializeDatabase } = require('./src/config/database');
const Project = require('./src/models/Project');
const Unit = require('./src/models/Unit');
const Module = require('./src/models/Module');
const ModuleAttribute = require('./src/models/ModuleAttribute');

// Import routes
const authRoutes = require('./src/routes/auth-simple');
const revitRoutes = require('./src/routes/revit');
const revitModelRoutes = require('./src/routes/revitRoutes');
const dataRoutes = require('./src/routes/data');
const uploadRoutes = require('./src/routes/upload');

// Import middleware
const { authenticateToken, requirePermission } = require('./src/middleware/simple-auth');

const app = express();
const PORT = process.env.PORT || 5001;

// 創建必要的目錄
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/revit'),
    path.join(__dirname, 'uploads/bulk'),
    path.join(__dirname, 'exports'),
    path.join(__dirname, 'temp')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// 初始化目錄
createDirectories();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Initialize database on startup
initializeDatabase().catch(console.error);

// Auth routes
app.use('/api/auth', authRoutes);

// Revit VR routes
app.use('/api/revit', revitRoutes);

// Revit model management routes
app.use('/api/revit', authenticateToken, revitModelRoutes);

// Data management routes (protected)
app.use('/api/data', authenticateToken, dataRoutes);

// Upload routes (protected)
app.use('/api/upload', authenticateToken, uploadRoutes);

// API Routes
// Get all projects
app.get('/api/projects', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects.map(project => project.toJSON()));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new project
app.post('/api/projects', authenticateToken, requirePermission('data_input'), async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project.toJSON());
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project' });
  }
});

// Update project
app.put('/api/projects/:projectId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const project = await Project.findByProjectId(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.update(req.body);
    res.json(project.toJSON());
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// Delete project
app.delete('/api/projects/:projectId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const project = await Project.findByProjectId(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.delete();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// Get specific project by ID
app.get('/api/projects/:id', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const project = await Project.findByProjectId(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project.toJSON());
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get units for a specific project
app.get('/api/projects/:projectId/units', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const units = await Unit.findByProjectId(req.params.projectId);
    res.json(units.map(unit => unit.toJSON()));
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all units
app.get('/api/units', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const { project_id, unit_type, status } = req.query;
    
    const filters = {};
    if (project_id) filters.project_id = project_id;
    if (unit_type) filters.unit_type = unit_type;
    if (status) filters.status = status;
    
    const units = await Unit.findAll(filters);
    res.json(units.map(unit => unit.toJSON()));
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new unit
app.post('/api/units', authenticateToken, requirePermission('data_input'), async (req, res) => {
  try {
    const unit = await Unit.create(req.body);
    res.status(201).json(unit.toJSON());
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Failed to create unit' });
  }
});

// Get specific unit by ID
app.get('/api/units/:unitId', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const unit = await Unit.findByUnitId(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit.toJSON());
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update unit
app.put('/api/units/:unitId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const unit = await Unit.findByUnitId(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    await unit.update(req.body);
    res.json(unit.toJSON());
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Failed to update unit' });
  }
});

// Delete unit
app.delete('/api/units/:unitId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const unit = await Unit.findByUnitId(req.params.unitId);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    
    await unit.delete();
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Failed to delete unit' });
  }
});

// Get modules for a specific unit
app.get('/api/units/:unitId/modules', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const modules = await Module.findByUnitId(req.params.unitId);
    res.json(modules.map(module => module.toJSON()));
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific module by ID
app.get('/api/modules/:moduleId', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    const module = await Module.findByModuleId(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get associated attributes
    const attributes = await ModuleAttribute.findByModuleId(req.params.moduleId);
    
    // Return module with its attributes
    const moduleData = module.toJSON();
    moduleData.attributes = attributes.map(attr => attr.toJSON());
    
    res.json(moduleData);
  } catch (error) {
    console.error('Error fetching module:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all modules
app.get('/api/modules', authenticateToken, requirePermission('read'), async (req, res) => {
  try {
    // Allow filtering by module_type, status, material, etc.
    const { module_type, status, major_material, intended_use } = req.query;
    
    const filters = {};
    if (module_type) filters.module_type = module_type;
    if (status) filters.status = status;
    if (major_material) filters.major_material = major_material;
    if (intended_use) filters.intended_use = intended_use;
    
    const modules = await Module.findAll(filters);
    res.json(modules.map(module => module.toJSON()));
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new module
app.post('/api/modules', authenticateToken, requirePermission('data_input'), async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json(module.toJSON());
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ message: 'Failed to create module' });
  }
});

// Update module
app.put('/api/modules/:moduleId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const module = await Module.findByModuleId(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    await module.update(req.body);
    res.json(module.toJSON());
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ message: 'Failed to update module' });
  }
});

// Delete module
app.delete('/api/modules/:moduleId', authenticateToken, requirePermission('modify'), async (req, res) => {
  try {
    const module = await Module.findByModuleId(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    await module.delete();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ message: 'Failed to delete module' });
  }
});

// Search modules
app.get('/api/search/modules', authenticateToken, requirePermission('search'), async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const modules = await Module.search(query);
    res.json(modules.map(module => module.toJSON()));
  } catch (error) {
    console.error('Error searching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 