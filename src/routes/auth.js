const express = require('express');
const { User, USER_ROLES } = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

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
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.username === username ? 'Username already exists' : 'Email already registered'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      fullName,
      organization,
      role,
      phoneNumber
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        role: user.role,
        permissions: user.getPermissions(),
        createdAt: user.createdAt
      }
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
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        role: user.role,
        permissions: user.getPermissions(),
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Get current user information
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName,
        organization: req.user.organization,
        role: req.user.role,
        permissions: req.user.getPermissions(),
        phoneNumber: req.user.phoneNumber,
        lastLogin: req.user.lastLogin,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user information error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user information
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, organization, phoneNumber } = req.body;
    const user = req.user;

    if (fullName) user.fullName = fullName;
    if (organization) user.organization = organization;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        role: user.role,
        phoneNumber: user.phoneNumber,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user information error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current password and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available roles
router.get('/roles', (req, res) => {
  try {
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

    res.json({
      roles: roleDescriptions,
      availableRoles: Object.values(USER_ROLES)
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all users
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });

    res.json({
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update user status
router.put('/users/:userId/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 