const express = require('express');
const router = express.Router();
const { User, USER_ROLES } = require('../models/User');

// Permission definitions
const PERMISSIONS = {
  READ: 'read',           // Read
  SEARCH: 'search',       // Search
  MODIFY: 'modify',       // Modify
  ANALYZE: 'analyze',     // Analyze
  COMMENT: 'comment',     // Add Comments
  DATA_INPUT: 'data_input' // Data Input
};

// Role permission mapping
const ROLE_PERMISSIONS = {
  [USER_ROLES.DESIGNER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.MODIFY,
    PERMISSIONS.ANALYZE,
    PERMISSIONS.COMMENT
  ],
  [USER_ROLES.DEVELOPER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.ANALYZE
  ],
  [USER_ROLES.POLICY_MAKER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.ANALYZE
  ],
  [USER_ROLES.CONTRACTOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.MODIFY,
    PERMISSIONS.COMMENT
  ],
  [USER_ROLES.MANUFACTURER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.DATA_INPUT
  ],
  [USER_ROLES.SUBCONTRACTOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH
  ],
  [USER_ROLES.SUPPLIER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH
  ],
  [USER_ROLES.OPERATOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.MODIFY
  ],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.MODIFY,
    PERMISSIONS.ANALYZE,
    PERMISSIONS.COMMENT,
    PERMISSIONS.DATA_INPUT
  ]
};

let tokens = {}; // Store token and user ID mapping

// Generate simple token (should use JWT in production)
const generateToken = (userId) => {
  const token = `token_${userId}_${Date.now()}`;
  tokens[token] = userId;
  return token;
};

// Verify token and get user
const getUserFromToken = async (token) => {
  if (!token) return null;
  const userId = tokens[token];
  if (!userId) return null;
  
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, organization, role, phoneNumber } = req.body;

    // Validate required fields
    if (!username || !email || !password || !fullName || !organization || !role) {
      return res.status(400).json({ 
        message: 'Please fill in all required fields',
        required: ['username', 'email', 'password', 'fullName', 'organization', 'role']
      });
    }

    // Validate role
    if (!Object.values(USER_ROLES).includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid user role',
        validRoles: Object.values(USER_ROLES)
      });
    }

    // Check if username and email already exist
    const existingUser = await User.findByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Username already exists' : 'Email already registered'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      organization,
      role,
      phoneNumber
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user information (without password)
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    userWithoutPassword.permissions = ROLE_PERMISSIONS[user.role] || [];

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter username and password' });
    }

    // Find user (supports username or email login)
    const user = await User.findByUsernameOrEmail(username, username);
    
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    // Update last login time
    await User.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user.id);

    // Return user information (without password)
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    userWithoutPassword.permissions = ROLE_PERMISSIONS[user.role] || [];

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Get all available roles
router.get('/roles', (req, res) => {
  const roleDescriptions = {
    [USER_ROLES.DESIGNER]: 'Designer',
    [USER_ROLES.DEVELOPER]: 'Developer',
    [USER_ROLES.POLICY_MAKER]: 'Policy Maker',
    [USER_ROLES.CONTRACTOR]: 'Contractor',
    [USER_ROLES.MANUFACTURER]: 'Manufacturer',
    [USER_ROLES.SUBCONTRACTOR]: 'Subcontractor',
    [USER_ROLES.SUPPLIER]: 'Supplier',
    [USER_ROLES.OPERATOR]: 'Operator',
    [USER_ROLES.ADMIN]: 'System Administrator'
  };

  const roles = Object.values(USER_ROLES).map(role => ({
    value: role,
    label: roleDescriptions[role],
    permissions: ROLE_PERMISSIONS[role] || []
  }));

  res.json({ roles });
});

// Get current user information
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token missing' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ message: 'User does not exist or has been disabled' });
    }

    // Return user information (without password)
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;
    userWithoutPassword.permissions = ROLE_PERMISSIONS[user.role] || [];

    res.json({
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user information error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router; 