const { initializeDatabase } = require('../config/database');
const Project = require('../models/Project');
const Unit = require('../models/Unit');
const Module = require('../models/Module');
const ModuleAttribute = require('../models/ModuleAttribute');
const { User, USER_ROLES } = require('../models/User');

// Import mock data
const { projects, units, modules, moduleAttributes } = require('../data/mockData');

// Default user data
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@mic-platform.com',
    password: 'admin123',
    role: USER_ROLES.ADMIN,
    fullName: 'System Administrator',
    organization: 'MiC Data Platform',
    phoneNumber: '+852-1234-5678'
  },
  {
    username: 'designer',
    email: 'designer@example.com',
    password: 'designer123',
    role: USER_ROLES.DESIGNER,
    fullName: 'John Designer',
    organization: 'Architectural Design Company',
    phoneNumber: '+852-2345-6789'
  },
  {
    username: 'contractor',
    email: 'contractor@example.com',
    password: 'contractor123',
    role: USER_ROLES.CONTRACTOR,
    fullName: 'Mike Contractor',
    organization: 'Construction Company',
    phoneNumber: '+852-3456-7890'
  },
  {
    username: 'manufacturer',
    email: 'manufacturer@example.com',
    password: 'manufacturer123',
    role: USER_ROLES.MANUFACTURER,
    fullName: 'Sarah Manufacturer',
    organization: 'Module Manufacturing Company',
    phoneNumber: '+852-4567-8901'
  },
  {
    username: 'supplier',
    email: 'supplier@example.com',
    password: 'supplier123',
    role: USER_ROLES.SUPPLIER,
    fullName: 'David Supplier',
    organization: 'Material Supply Company',
    phoneNumber: '+852-5678-9012'
  }
];

async function initializeData() {
  try {
    console.log('Initializing database...');
    
    // Initialize database table structure
    await initializeDatabase();
    
    console.log('Creating default users...');
    // Create default users
    for (const userData of defaultUsers) {
      try {
        await User.create(userData);
        console.log(`User ${userData.username} (${userData.fullName}) created successfully`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`User ${userData.username} already exists, skipping`);
        } else {
          console.error(`Failed to create user ${userData.username}:`, error.message);
        }
      }
    }
    
    console.log('Importing project data...');
    // Import project data
    for (const projectData of projects) {
      try {
        await Project.create(projectData);
        console.log(`Project ${projectData.project_id} imported successfully`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`Project ${projectData.project_id} already exists, skipping`);
        } else {
          console.error(`Failed to import project ${projectData.project_id}:`, error.message);
        }
      }
    }

    console.log('Importing unit data...');
    // Import unit data
    for (const unitData of units) {
      try {
        await Unit.create(unitData);
        console.log(`Unit ${unitData.unit_id} imported successfully`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`Unit ${unitData.unit_id} already exists, skipping`);
        } else {
          console.error(`Failed to import unit ${unitData.unit_id}:`, error.message);
        }
      }
    }

    console.log('Importing module data...');
    // Import module data
    for (const moduleData of modules) {
      try {
        await Module.create(moduleData);
        console.log(`Module ${moduleData.module_id} imported successfully`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`Module ${moduleData.module_id} already exists, skipping`);
        } else {
          console.error(`Failed to import module ${moduleData.module_id}:`, error.message);
        }
      }
    }

    console.log('Importing module attribute data...');
    // Import module attribute data
    for (const attributeData of moduleAttributes) {
      try {
        await ModuleAttribute.create(attributeData);
        console.log(`Module attribute ${attributeData.attribute_id} imported successfully`);
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`Module attribute ${attributeData.attribute_id} already exists, skipping`);
        } else {
          console.error(`Failed to import module attribute ${attributeData.attribute_id}:`, error.message);
        }
      }
    }

    console.log('Data initialization completed successfully!');
    console.log('\nDefault users created:');
    defaultUsers.forEach(user => {
      console.log(`- ${user.username} (${user.fullName}) - Role: ${user.role}`);
    });
    
    console.log('\nYou can now start the server and login with any of the above accounts.');
    
  } catch (error) {
    console.error('Data initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeData()
    .then(() => {
      console.log('Initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Initialization script failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeData, defaultUsers }; 