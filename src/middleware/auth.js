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
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: '訪問令牌缺失' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: '用戶不存在或已被禁用' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '無效的訪問令牌' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '訪問令牌已過期' });
    }
    return res.status(500).json({ message: '服務器錯誤' });
  }
};

// 權限檢查中間件工廠函數
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '用戶未認證' });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        message: '權限不足',
        required: permission,
        userRole: req.user.role,
        userPermissions: req.user.getPermissions()
      });
    }

    next();
  };
};

// 角色檢查中間件工廠函數
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '用戶未認證' });
    }

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({ 
        message: '角色權限不足',
        required: roleArray,
        userRole: req.user.role
      });
    }

    next();
  };
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
  requireRole,
  optionalAuth,
  JWT_SECRET
}; 