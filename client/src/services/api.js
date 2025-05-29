import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Project-related API calls
export const ProjectService = {
  // Get all projects
  getProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  // Get a specific project by ID
  getProject: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      throw error;
    }
  },
  
  // Get units for a specific project
  getProjectUnits: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/units`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching units for project ${projectId}:`, error);
      throw error;
    }
  }
};

// Unit-related API calls
export const UnitService = {
  // Get a specific unit by ID
  getUnit: async (unitId) => {
    try {
      const response = await api.get(`/units/${unitId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching unit ${unitId}:`, error);
      throw error;
    }
  },
  
  // Get modules for a specific unit
  getUnitModules: async (unitId) => {
    try {
      const response = await api.get(`/units/${unitId}/modules`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching modules for unit ${unitId}:`, error);
      throw error;
    }
  }
};

// Module-related API calls
export const ModuleService = {
  // Get all modules (with optional filters)
  getModules: async (filters = {}) => {
    try {
      const response = await api.get('/modules', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching modules:', error);
      throw error;
    }
  },
  
  // Get a specific module by ID
  getModule: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching module ${moduleId}:`, error);
      throw error;
    }
  },
  
  // Search modules
  searchModules: async (query) => {
    try {
      const response = await api.get('/search/modules', {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching modules with query "${query}":`, error);
      throw error;
    }
  }
}; 