const { User } = require('../models/User');

// 共享token存储（与auth-simple.js保持一致）
// 在生产环境中应该使用Redis或数据库存储
let tokens = {};

// 权限定义
const ROLE_PERMISSIONS = {
  'designer': ['read', 'search', 'modify', 'analyze', 'comment'],
  'developer': ['read', 'search', 'analyze'],
  'policy_maker': ['read', 'search', 'analyze'],
  'contractor': ['read', 'search', 'modify', 'comment'],
  'manufacturer': ['read', 'search', 'data_input'],
  'subcontractor': ['read', 'search'],
  'supplier': ['read', 'search'],
  'operator': ['read', 'search', 'modify'],
  'admin': ['read', 'search', 'modify', 'analyze', 'comment', 'data_input']
};

// 设置token存储（用于在不同模块间共享token）
const setTokens = (tokenStore) => {
  tokens = tokenStore;
};

// 获取token存储
const getTokens = () => {
  return tokens;
};

// 从token获取用户
const getUserFromToken = async (token) => {
  if (!token) return null;
  const userId = tokens[token];
  if (!userId) return null;
  
  try {
    const user = await User.findById(userId);
    if (user) {
      // 添加权限到用户对象
      user.permissions = ROLE_PERMISSIONS[user.role] || [];
    }
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// 认证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// 权限检查中间件
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    // Admin用户拥有所有权限
    if (req.user.role === 'admin' || userPermissions.includes(permission)) {
      next();
    } else {
      return res.status(403).json({ 
        message: `Permission '${permission}' required`,
        userPermissions: userPermissions,
        requiredPermission: permission
      });
    }
  };
};

// 检查多个权限（任一即可）
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    // Admin用户拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (hasPermission) {
      next();
    } else {
      return res.status(403).json({ 
        message: `One of the following permissions required: ${permissions.join(', ')}`,
        userPermissions: userPermissions,
        requiredPermissions: permissions
      });
    }
  };
};

// 检查所有权限（必须全部拥有）
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userPermissions = req.user.permissions || [];
    
    // Admin用户拥有所有权限
    if (req.user.role === 'admin') {
      return next();
    }

    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (hasAllPermissions) {
      next();
    } else {
      return res.status(403).json({ 
        message: `All of the following permissions required: ${permissions.join(', ')}`,
        userPermissions: userPermissions,
        requiredPermissions: permissions
      });
    }
  };
};

// 角色检查中间件
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (roleArray.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ 
        message: `Role access denied. Required: ${roleArray.join(' or ')}`,
        userRole: req.user.role,
        requiredRoles: roleArray
      });
    }
  };
};

// 检查是否为管理员
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Administrator access required',
      userRole: req.user.role
    });
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireAdmin,
  setTokens,
  getTokens,
  getUserFromToken,
  ROLE_PERMISSIONS
}; 