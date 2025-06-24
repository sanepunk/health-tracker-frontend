import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000';
const API_PREFIX = '/api/v1';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check localStorage first, then sessionStorage
    let token = localStorage.getItem('accessToken');
    if (!token) {
      token = sessionStorage.getItem('accessToken');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Check localStorage first, then sessionStorage for refresh token
        let refreshToken = localStorage.getItem('refreshToken');
        let isRememberMe = true;
        if (!refreshToken) {
          refreshToken = sessionStorage.getItem('refreshToken');
          isRememberMe = false;
        }
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data;
          
          // Store new token in the same location as the original
          if (isRememberMe) {
            localStorage.setItem('accessToken', access_token);
          } else {
            sessionStorage.setItem('accessToken', access_token);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login and clear all storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== AUTH API ====================

export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  // Get current user information
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get user info');
    }
  },

  // Validate password strength
  validatePassword: async (password) => {
    try {
      const response = await api.post('/auth/validate-password', null, {
        params: { password },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Password validation failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      throw new Error(error.response?.data?.detail || 'Logout failed');
    }
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Token refresh failed');
    }
  },

  // Recover password using recovery key
  recoverPassword: async (recoveryData) => {
    try {
      const response = await api.post('/auth/recover-password', {
        email: recoveryData.email,
        recovery_key: recoveryData.recoveryKey,
        new_password: recoveryData.newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Password recovery failed');
    }
  },
};

// ==================== WELLNESS API ====================

export const wellnessAPI = {
  // Mark daily progress
  markProgress: async (progressData) => {
    try {
      const response = await api.post('/wellness/progress', {
        date: progressData.date,
        completed: progressData.completed,
        notes: progressData.notes || null,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to mark progress');
    }
  },

  // Get user progress for date range
  getUserProgress: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/wellness/progress', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get progress');
    }
  },

  // Get monthly progress
  getMonthlyProgress: async (year, month) => {
    try {
      const response = await api.get('/wellness/progress/monthly', {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get monthly progress');
    }
  },

  // Get all achievements
  getAllAchievements: async () => {
    try {
      const response = await api.get('/wellness/achievements');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get achievements');
    }
  },

  // Get user's earned achievements
  getUserAchievements: async () => {
    try {
      const response = await api.get('/wellness/achievements/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get user achievements');
    }
  },

  // Check for new achievements
  checkAchievements: async () => {
    try {
      const response = await api.post('/wellness/achievements/check');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to check achievements');
    }
  },

  // Get leaderboard
  getLeaderboard: async (leaderboardType = 'current_streak', limit = 10) => {
    try {
      const response = await api.get('/wellness/leaderboard', {
        params: {
          leaderboard_type: leaderboardType,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get leaderboard');
    }
  },

  // Get user's rank in leaderboard
  getUserRank: async (leaderboardType = 'current_streak') => {
    try {
      const response = await api.get('/wellness/leaderboard/rank', {
        params: { leaderboard_type: leaderboardType },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get user rank');
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get('/wellness/stats/user');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get user stats');
    }
  },

  // Get motivational quotes
  getQuotes: async () => {
    try {
      const response = await api.get('/wellness/quotes');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get quotes');
    }
  },
};

// ==================== GENERAL API ====================

export const generalAPI = {
  // Health check
  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Health check failed');
    }
  },

  // API root
  getAPIInfo: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to get API info');
    }
  },
};

// ==================== UTILITY FUNCTIONS ====================

export const apiUtils = {
  // Store auth tokens
  storeTokens: (tokens) => {
    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);
  },

  // Store user data
  storeUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Clear all stored data
  clearStorage: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Format date for API (YYYY-MM-DD)
  formatDate: (date) => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return date;
  },

  // Parse date from API
  parseDate: (dateString) => {
    return new Date(dateString);
  },

  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.detail || error.message;

      switch (status) {
        case 400:
          return `Bad Request: ${message}`;
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Access forbidden. You do not have permission.';
        case 404:
          return 'Resource not found.';
        case 422:
          return 'Validation error. Please check your input.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message || 'An unexpected error occurred.';
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.';
    }
  },
};

// Export default api instance for direct use if needed
export default api; 