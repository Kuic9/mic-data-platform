const jwt = require('jsonwebtoken');
const { User, PERMISSIONS } = require('../models/User');

// JWT密鑰（在生產環境中應該使用環境變量）
const JWT_SECRET = process.env.JWT_SECRET || 'mic_data_platform_jwt_secret_key_2024';

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 驗證JWT令牌中間件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// 權限檢查中間件工廠函數
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

// 檢查多個權限（任一即可）
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

// 檢查所有權限（必須全部擁有）
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

// 角色檢查中間件工廠函數
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

// 檢查是否為管理員
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

// 可選認證中間件（不強制要求登錄）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 忽略錯誤，繼續處理請求
    next();
  }
};

module.exports = {
  generateToken,
  authenticateToken,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
}; 