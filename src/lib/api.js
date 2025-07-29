const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-railway-app.railway.app/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          const newToken = localStorage.getItem('access_token');
          config.headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, config);
          return await this.handleResponse(retryResponse);
        } else {
          // Refresh failed, redirect to login
          this.logout();
          throw new Error('Authentication failed');
        }
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  // Website methods
  async getWebsites() {
    return await this.request('/websites');
  }

  async addWebsite(websiteData) {
    return await this.request('/websites', {
      method: 'POST',
      body: JSON.stringify(websiteData),
    });
  }

  // Analytics methods
  async getAnalytics(websiteId, dateRange = '30d') {
    return await this.request(`/analytics/${websiteId}?range=${dateRange}`);
  }

  async getOverviewMetrics(websiteId) {
    return await this.request(`/analytics/${websiteId}/overview`);
  }

  async getRealtimeUsers(websiteId) {
    return await this.request(`/analytics/${websiteId}/realtime`);
  }

  // Admin methods
  async getAdminUsers(page = 1, search = '', status = 'all') {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '50',
      ...(search && { search }),
      ...(status !== 'all' && { status })
    });
    
    return await this.request(`/admin/users?${params}`);
  }

  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  async updateUserStatus(userId, status) {
    return await this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updateUserPlan(userId, planData) {
    return await this.request(`/admin/users/${userId}/plan`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  }

  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async impersonateUser(userId) {
    return await this.request(`/admin/users/${userId}/impersonate`, {
      method: 'POST',
    });
  }

  // Client methods (legacy admin routes)
  async getClients(page = 1, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: '20',
      ...(search && { search })
    });
    
    return await this.request(`/admin/clients?${params}`);
  }

  async createClient(clientData) {
    return await this.request('/admin/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(clientId, clientData) {
    return await this.request(`/admin/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(clientId) {
    return await this.request(`/admin/clients/${clientId}`, {
      method: 'DELETE',
    });
  }

  async getClientWebsites(clientId) {
    return await this.request(`/admin/clients/${clientId}/websites`);
  }

  async impersonateClient(clientId) {
    return await this.request(`/admin/clients/${clientId}/impersonate`, {
      method: 'POST',
    });
  }
}

export default new ApiService();

