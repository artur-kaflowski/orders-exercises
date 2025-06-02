import { LitElement, html, css } from 'lit';
import { apiService } from '../services/api-service.js';

export class OrderList extends LitElement {
  static get properties() {
    return {
      orders: { type: Array },
      loading: { type: Boolean },
      error: { type: String },
      searchFilters: { type: Object },
      showFilters: { type: Boolean },
      validationErrors: { type: Object }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      button {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        background-color: var(--primary-color, #007bff);
        color: white;
      }

      button:hover {
        opacity: 0.9;
      }

      button.btn-danger {
        background-color: var(--error-color, #dc3545);
      }

      button.btn-warning {
        background-color: var(--warning-color, #ffc107);
        color: #212529;
      }

      button.btn-success {
        background-color: var(--success-color, #28a745);
      }

      .order-list {
        width: 100%;
        border-collapse: collapse;
      }

      .order-list th,
      .order-list td {
        padding: 0.75rem;
        border: 1px solid #ccc;
        text-align: left;
      }

      .order-list th {
        background-color: #f4f4f4;
      }

      .loading {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .error {
        color: var(--error-color);
        padding: 1rem;
        border: 1px solid var(--error-color);
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .empty-message {
        text-align: center;
        padding: 2rem;
        color: var(--dark-color);
      }

      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
      }

      .status-NEW {
        background-color: var(--primary-color);
        color: white;
      }

      .status-PROCESSING {
        background-color: var(--warning-color);
        color: white;
      }

      .status-COMPLETED {
        background-color: var(--success-color);
        color: white;
      }

      .status-CANCELLED {
        background-color: var(--error-color);
        color: white;
      }

      .filter-section {
        background-color: #f9f9f9;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .filter-form {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .filter-form input, .filter-form select {
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .filter-buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .validation-error {
        color: var(--error-color);
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }
    `;
  }

  constructor() {
    super();
    this.orders = [];
    this.loading = true;
    this.error = null;
    this.searchFilters = {
      id: '',
      status: '',
      userId: '',
      description: '',
      startDate: '',
      endDate: ''
    };
    this.showFilters = false;
    this.validationErrors = {};
    this.debounceTimeout = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadOrders();
  }

  async loadOrders() {
    try {
      this.loading = true;
      this.orders = await apiService.getOrders();
    } catch (err) {
      console.error(err);

      if (err.data && err.data.message) {
        // Handle structured errors
        this.error = `Error: ${err.data.message}`;
      } else {
        // Fallback to generic error message
        this.error = `Failed to load orders: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  navigateToCreateOrder() {
    history.pushState({}, '', '/create-order');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  async handleDelete(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await apiService.deleteOrder(orderId);
      this.orders = this.orders.filter(order => order.id !== orderId);
    } catch (err) {
      console.error(err);

      if (err.data && err.data.message) {
        // Handle structured errors
        this.error = `Error: ${err.data.message}`;
      } else {
        // Fallback to generic error message
        this.error = `Failed to delete order: ${err.message}`;
      }
    }
  }

  async handleStatusChange(orderId, newStatus) {
    try {
      const updatedOrder = await apiService.updateOrderStatus(orderId, newStatus);
      this.orders = this.orders.map(order => 
        order.id === orderId ? updatedOrder : order
      );
    } catch (err) {
      console.error(err);

      if (err.data && err.data.validationErrors) {
        // Handle structured validation errors
        const validationErrors = err.data.validationErrors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        this.error = `Validation error: ${errorMessages}`;
      } else if (err.data && err.data.message) {
        // Handle other structured errors
        this.error = `Error: ${err.data.message}`;
      } else {
        // Fallback to generic error message
        this.error = `Failed to update order status: ${err.message}`;
      }
    }
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  handleFilterChange(e) {
    const { name, value } = e.target;
    this.searchFilters = {
      ...this.searchFilters,
      [name]: value
    };

    // Clear any existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set a new timeout to call handleSearch after 300ms
    this.debounceTimeout = setTimeout(() => {
      this.handleSearch();
    }, 300);
  }

  async handleSearch() {
    try {
      this.loading = true;
      this.error = null;

      // Prepare filters, removing empty values
      const filters = Object.entries(this.searchFilters)
        .reduce((acc, [key, value]) => {
          if (value !== '') {
            // Convert ID and userId to numbers if they're not empty
            if ((key === 'id' || key === 'userId') && value !== '') {
              acc[key] = parseInt(value, 10);
            } else {
              acc[key] = value;
            }
          }
          return acc;
        }, {});

      this.orders = await apiService.searchOrders(filters);
    } catch (err) {
      console.error(err);

      if (err.data && err.data.validationErrors) {
        // Handle structured validation errors
        const validationErrors = err.data.validationErrors;
        const errorMessages = Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        this.error = `Validation error: ${errorMessages}`;
      } else if (err.data && err.data.message) {
        // Handle other structured errors
        this.error = `Error: ${err.data.message}`;
      } else {
        // Fallback to generic error message
        this.error = `Search failed: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  resetFilters() {
    this.searchFilters = {
      id: '',
      status: '',
      userId: '',
      description: '',
      startDate: '',
      endDate: ''
    };
    this.loadOrders();
  }

  renderFilters() {
    if (!this.showFilters) return '';

    return html`
      <div class="filter-section">
        <h4>Filter Orders</h4>
        <div class="filter-form">
          <div>
            <label for="id">Order ID</label>
            <input 
              type="number" 
              id="id" 
              name="id" 
              .value=${this.searchFilters.id}
              @input=${this.handleFilterChange}
              placeholder="Order ID"
            >
          </div>

          <div>
            <label for="status">Status</label>
            <select 
              id="status" 
              name="status" 
              .value=${this.searchFilters.status}
              @change=${this.handleFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="PROCESSING">Processing</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label for="userId">User ID</label>
            <input 
              type="number" 
              id="userId" 
              name="userId" 
              .value=${this.searchFilters.userId}
              @input=${this.handleFilterChange}
              placeholder="User ID"
            >
          </div>

          <div>
            <label for="description">Description</label>
            <input 
              type="text" 
              id="description" 
              name="description" 
              .value=${this.searchFilters.description}
              @input=${this.handleFilterChange}
              placeholder="Description"
            >
          </div>

          <div>
            <label for="startDate">Start Date</label>
            <input 
              type="datetime-local" 
              id="startDate" 
              name="startDate" 
              .value=${this.searchFilters.startDate}
              @input=${this.handleFilterChange}
            >
          </div>

          <div>
            <label for="endDate">End Date</label>
            <input 
              type="datetime-local" 
              id="endDate" 
              name="endDate" 
              .value=${this.searchFilters.endDate}
              @input=${this.handleFilterChange}
            >
          </div>
        </div>

        <div class="filter-buttons">
          <button @click=${this.resetFilters}>Reset Filters</button>
        </div>
      </div>
    `;
  }

  renderStatusChangeButtons(order) {
    const buttons = [];

    // Only show status change buttons for statuses that make sense
    switch(order.status) {
      case 'NEW':
        buttons.push(html`
          <button class="btn-warning" @click=${() => this.handleStatusChange(order.id, 'PROCESSING')}>
            Process
          </button>
        `);
        buttons.push(html`
          <button class="btn-danger" @click=${() => this.handleStatusChange(order.id, 'CANCELLED')}>
            Cancel
          </button>
        `);
        break;
      case 'PROCESSING':
        buttons.push(html`
          <button class="btn-success" @click=${() => this.handleStatusChange(order.id, 'COMPLETED')}>
            Complete
          </button>
        `);
        buttons.push(html`
          <button class="btn-danger" @click=${() => this.handleStatusChange(order.id, 'CANCELLED')}>
            Cancel
          </button>
        `);
        break;
      // No status change buttons for COMPLETED or CANCELLED
    }

    return buttons;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <p>Loading orders...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error">
          <p>${this.error}</p>
          <button @click=${() => this.loadOrders()}>Retry</button>
        </div>
      `;
    }

    if (!this.orders || this.orders.length === 0) {
      return html`
        <div>
          <h3>Orders</h3>
          <button style="margin-right: 0.5rem;" @click=${this.navigateToCreateOrder}>Create New Order</button>
          <button @click=${this.toggleFilters}>
            ${this.showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          ${this.renderFilters()}

          <div class="empty-message">
            <p>No orders found.</p>
          </div>
        </div>
      `;
    }

    return html`
      <div>
        <h3>Orders</h3>
        <div style="margin-bottom: 1rem;">
          <button style="margin-right: 0.5rem;" @click=${this.navigateToCreateOrder}>Create New Order</button>
          <button @click=${this.toggleFilters}>
            ${this.showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        ${this.renderFilters()}

        <table class="order-list">
          <thead>
            <tr>
              <th>ID</th>
              <th>Created At</th>
              <th>Status</th>
              <th>User ID</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.orders.map(order => html`
              <tr>
                <td>${order.id}</td>
                <td>${new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  <span class="status-badge status-${order.status}">
                    ${order.status}
                  </span>
                </td>
                <td>${order.userId}</td>
                <td>${order.description}</td>
                <td class="actions">
                  ${this.renderStatusChangeButtons(order)}
                  <button class="btn-danger" @click=${() => this.handleDelete(order.id)}>Delete</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
    `;
  }
}

customElements.define('order-list', OrderList);
