const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.mysitemetrics.io/api';

class ApiService {
  constructor( ) {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('access_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET method
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST method
  async post(endpoint, data = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  // PUT method
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE method
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Existing methods (keep these)
  async login(credentials) {
    return this.post('/auth/login', credentials);
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async getDashboardData(websiteId) {
    return this.get(`/dashboard/${websiteId}`);
  }

  async getWebsites() {
    return this.get('/websites');
  }

  async addWebsite(websiteData) {
    return this.post('/websites', websiteData);
  }

  async updateWebsite(websiteId, websiteData) {
    return this.put(`/websites/${websiteId}`, websiteData);
  }

  async deleteWebsite(websiteId) {
    return this.delete(`/websites/${websiteId}`);
  }
}

const apiService = new ApiService();
export default apiService;
