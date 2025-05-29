const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Import database configuration and models
const { initializeDatabase } = require('./src/config/database');
const Project = require('./src/models/Project');
const Unit = require('./src/models/Unit');
const Module = require('./src/models/Module');
const ModuleAttribute = require('./src/models/ModuleAttribute');

// Import routes
const authRoutes = require('./src/routes/auth-simple');
const revitRoutes = require('./src/routes/revit');

const app = express();
const PORT = process.env.PORT || 5001;

// 創建必要的目錄
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/revit'),
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

// API Routes
// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.json(projects.map(project => project.toJSON()));
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific project by ID
app.get('/api/projects/:id', async (req, res) => {
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
app.get('/api/projects/:projectId/units', async (req, res) => {
  try {
    const units = await Unit.findByProjectId(req.params.projectId);
    res.json(units.map(unit => unit.toJSON()));
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific unit by ID
app.get('/api/units/:id', async (req, res) => {
  try {
    const unit = await Unit.findByUnitId(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit.toJSON());
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get modules for a specific unit
app.get('/api/units/:unitId/modules', async (req, res) => {
  try {
    const modules = await Module.findByUnitId(req.params.unitId);
    res.json(modules.map(module => module.toJSON()));
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific module by ID
app.get('/api/modules/:id', async (req, res) => {
  try {
    const module = await Module.findByModuleId(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Get associated attributes
    const attributes = await ModuleAttribute.findByModuleId(req.params.id);
    
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
app.get('/api/modules', async (req, res) => {
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

// Search modules
app.get('/api/search/modules', async (req, res) => {
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