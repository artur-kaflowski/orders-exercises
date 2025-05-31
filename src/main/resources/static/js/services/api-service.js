/**
 * Service for interacting with the backend API
 */
export class ApiService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic method to make API requests
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      if (response.status === 204) {
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all orders
   * @returns {Promise<Array>} - List of orders
   */
  async getOrders() {
    return this.request('/orders');
  }

  /**
   * Get a specific order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} - Order data
   */
  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  /**
   * Update an order
   * @param {number} id - Order ID
   * @param {Object} orderData - Updated order data
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrder(id, orderData) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  }

  /**
   * Delete an order
   * @param {number} id - Order ID
   * @returns {Promise<void>}
   */
  async deleteOrder(id) {
    return this.request(`/orders/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();
