import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import Dashboard from './components/Dashboard';
import Layout from './components/common/Layout';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import UnitDetailPage from './pages/UnitDetailPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import ModulesPage from './pages/ModulesPage';
import VRPage from './pages/VRPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* VR page - independent route, doesn't need Layout */}
        <Route path="/vr" element={
          <ProtectedRoute>
            <VRPage />
          </ProtectedRoute>
        } />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          <Route path="projects" element={
            <ProtectedRoute requiredPermission="read">
              <ProjectsPage />
            </ProtectedRoute>
          } />
          
          <Route path="projects/:projectId" element={
            <ProtectedRoute requiredPermission="read">
              <ProjectDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="units/:unitId" element={
            <ProtectedRoute requiredPermission="read">
              <UnitDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="modules" element={
            <ProtectedRoute requiredPermission="read">
              <ModulesPage />
            </ProtectedRoute>
          } />
          
          <Route path="modules/:moduleId" element={
            <ProtectedRoute requiredPermission="read">
              <ModuleDetailPage />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App; 