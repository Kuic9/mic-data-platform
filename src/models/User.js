const bcrypt = require('bcryptjs');
const { db } = require('../config/database');

// Define user roles and corresponding permissions
const USER_ROLES = {
  DESIGNER: 'designer',           // Designer
  DEVELOPER: 'developer',         // Developer
  POLICY_MAKER: 'policy_maker',   // Policy Maker
  CONTRACTOR: 'contractor',       // Contractor
  MANUFACTURER: 'manufacturer',   // Manufacturer
  SUBCONTRACTOR: 'subcontractor', // Subcontractor
  SUPPLIER: 'supplier',           // Supplier
  OPERATOR: 'operator',           // Operator
  ADMIN: 'admin'                  // System Administrator
};

// Permission definitions
const PERMISSIONS = {
  READ: 'read',           // Read
  SEARCH: 'search',       // Search
  MODIFY: 'modify',       // Modify
  ANALYZE: 'analyze',     // Analyze
  COMMENT: 'comment',     // Add Comments
  DATA_INPUT: 'data_input' // Data Input
};

// Role permission mapping (based on the permission allocation table you provided)
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
    PERMISSIONS.ANALYZE
  ],
  [USER_ROLES.MANUFACTURER]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH,
    PERMISSIONS.MODIFY
  ],
  [USER_ROLES.SUBCONTRACTOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.SEARCH
  ],
  [USER_ROLES.SUPPLIER]: [
    PERMISSIONS.READ
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

class User {
  constructor(userData) {
    this.id = userData.id;
    this.username = userData.username;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || USER_ROLES.SUPPLIER;
    this.fullName = userData.full_name;
    this.organization = userData.organization;
    this.phoneNumber = userData.phone_number;
    this.isActive = userData.is_active !== undefined ? userData.is_active : true;
    this.lastLogin = userData.last_login;
    this.createdAt = userData.created_at;
    this.updatedAt = userData.updated_at;
  }

  // Create new user
  static async create(userData) {
    try {
      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
          INSERT INTO users (username, email, password, role, full_name, organization, phone_number, is_active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run([
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || USER_ROLES.SUPPLIER,
          userData.fullName,
          userData.organization,
          userData.phoneNumber || null,
          userData.isActive !== undefined ? userData.isActive : true
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            // Get created user
            User.findById(this.lastID)
              .then(user => resolve(user))
              .catch(err => reject(err));
          }
        });

        stmt.finalize();
      });
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Find user by username
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Find user by email
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Find user by username or email
  static async findByUsernameOrEmail(username, email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Get all users
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const users = rows.map(row => new User(row));
          resolve(users);
        }
      });
    });
  }

  // Update user
  async update(updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return resolve(this);
      }

      // Add update time
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(this.id);

      const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          // Update current instance attributes
          Object.assign(this, updateData);
          resolve(this);
        }
      });
    });
  }

  // Update last login time
  async updateLastLogin() {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [this.id],
        (err) => {
          if (err) {
            reject(err);
          } else {
            this.lastLogin = new Date();
            resolve(this);
          }
        }
      );
    });
  }

  // Static method: Update last login time
  static async updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  // Delete user
  async delete() {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [this.id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  // Password verification method
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Get user permissions method
  getPermissions() {
    return ROLE_PERMISSIONS[this.role] || [];
  }

  // Check if user has specific permission
  hasPermission(permission) {
    const userPermissions = this.getPermissions();
    return userPermissions.includes(permission);
  }

  // Get user information (without password)
  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }
}

module.exports = {
  User,
  USER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS
}; 