import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requiredPermission = null, 
  requiredRole = null,
  fallbackPath = '/login' 
}) => {
  const { user, loading, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // 如果正在加載，顯示加載狀態
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>正在驗證用戶權限...</p>
      </div>
    );
  }

  // 如果需要認證但用戶未登錄
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 如果需要特定權限但用戶沒有
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="permission-denied">
        <h2>權限不足</h2>
        <p>您沒有訪問此頁面的權限。</p>
        <p>需要權限：{requiredPermission}</p>
        <p>您的角色：{user?.role}</p>
        <p>您的權限：{user?.permissions?.join(', ')}</p>
        <button onClick={() => window.history.back()}>返回上一頁</button>
      </div>
    );
  }

  // 如果需要特定角色但用戶沒有
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="permission-denied">
        <h2>角色權限不足</h2>
        <p>您的角色無法訪問此頁面。</p>
        <p>需要角色：{requiredRole}</p>
        <p>您的角色：{user?.role}</p>
        <button onClick={() => window.history.back()}>返回上一頁</button>
      </div>
    );
  }

  // 權限檢查通過，渲染子組件
  return children;
};

// 權限檢查Hook
export const usePermissionCheck = () => {
  const { user, hasPermission, hasRole } = useAuth();

  const checkPermission = (permission) => {
    return hasPermission(permission);
  };

  const checkRole = (role) => {
    return hasRole(role);
  };

  const checkMultiplePermissions = (permissions, requireAll = true) => {
    if (!permissions || permissions.length === 0) return true;
    
    if (requireAll) {
      return permissions.every(permission => hasPermission(permission));
    } else {
      return permissions.some(permission => hasPermission(permission));
    }
  };

  const checkMultipleRoles = (roles, requireAll = false) => {
    if (!roles || roles.length === 0) return true;
    
    if (requireAll) {
      return roles.every(role => hasRole(role));
    } else {
      return roles.some(role => hasRole(role));
    }
  };

  return {
    user,
    checkPermission,
    checkRole,
    checkMultiplePermissions,
    checkMultipleRoles,
    isAuthenticated: !!user
  };
};

// 權限顯示組件
export const PermissionGate = ({ 
  permission = null, 
  role = null, 
  permissions = null,
  roles = null,
  requireAll = true,
  fallback = null,
  children 
}) => {
  const { checkPermission, checkRole, checkMultiplePermissions, checkMultipleRoles } = usePermissionCheck();

  let hasAccess = true;

  // 檢查單個權限
  if (permission && !checkPermission(permission)) {
    hasAccess = false;
  }

  // 檢查單個角色
  if (role && !checkRole(role)) {
    hasAccess = false;
  }

  // 檢查多個權限
  if (permissions && !checkMultiplePermissions(permissions, requireAll)) {
    hasAccess = false;
  }

  // 檢查多個角色
  if (roles && !checkMultipleRoles(roles, requireAll)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return fallback || null;
  }

  return children;
};

export default ProtectedRoute;