import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // API base URL
  const API_BASE_URL = '/api';

  // Set authentication headers
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Login function
  const login = async (username, password) => {
    try {
      console.log('Attempting login:', username);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      
      console.log('Login successful, user:', data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Registration function
  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  // Get current user information
  const getCurrentUser = async () => {
    if (!token) {
      console.log('No token, skipping user info fetch');
      return null;
    }

    try {
      console.log('Fetching user info, token:', token);
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User info fetch successful:', data.user);
        setUser(data.user);
        return data.user;
      } else {
        console.log('User info fetch failed, status code:', response.status);
        // Token invalid, clear local storage
        if (response.status === 401) {
          logout();
        }
        return null;
      }
    } catch (error) {
      console.error('User info fetch error:', error);
      return null;
    }
  };

  // 刷新用戶狀態
  const refreshUser = async () => {
    if (!token) return null;
    return await getCurrentUser();
  };

  // 帶有自動重試的API調用包裝器
  const apiCall = async (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (response.status === 401) {
        // 嘗試刷新用戶狀態
        console.log('401 error, attempting to refresh user state');
        const refreshedUser = await refreshUser();
        
        if (refreshedUser) {
          // 重試原始請求
          return await fetch(url, {
            ...options,
            headers: {
              ...getAuthHeaders(),
              ...options.headers
            }
          });
        } else {
          // 刷新失敗，重定向到登錄
          logout();
          throw new Error('Authentication failed');
        }
      }

      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Check user permission
  const hasPermission = (permission) => {
    if (!user) return false;
    // Admin用戶擁有所有權限
    if (user.role === 'admin') return true;
    return user.permissions && user.permissions.includes(permission);
  };

  // Check user role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Update user information
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Update user info error:', error);
      return { success: false, error: error.message };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password change failed');
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message };
    }
  };

  // Get available roles
  const getRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/roles`);
      const data = await response.json();
      return data.roles;
    } catch (error) {
      console.error('Get role list error:', error);
      return [];
    }
  };

  // Initial check user status
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await getCurrentUser();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
    refreshUser,
    apiCall,
    hasPermission,
    hasRole,
    updateProfile,
    changePassword,
    getRoles,
    getAuthHeaders,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 