/**
 * API service for communicating with the Uptime Monitor backend.
 */
class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Helper to perform HTTP requests and parse JSON response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Set headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  }

  /**
   * Fetch all registered monitors with their recent checks
   */
  async getMonitors() {
    return this.request('/monitors');
  }

  /**
   * Fetch global statistics
   */
  async getStats() {
    return this.request('/stats');
  }

  /**
   * Register a new URL to monitor
   */
  async addMonitor(url, name) {
    return this.request('/monitors', {
      method: 'POST',
      body: JSON.stringify({ url, name }),
    });
  }

  /**
   * Remove a monitor and its history
   */
  async deleteMonitor(id) {
    return this.request(`/monitors/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Trigger an on-demand check for a specific monitor
   */
  async triggerManualCheck(id) {
    return this.request(`/monitors/${id}/ping`, {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
