import { LitElement, html, css } from 'lit';
import { apiService } from '../services/api-service.js';

export class OrderList extends LitElement {
  static get properties() {
    return {
      orders: { type: Array },
      loading: { type: Boolean },
      error: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }
      
      .order-list {
        width: 100%;
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
    `;
  }

  constructor() {
    super();
    this.orders = [];
    this.loading = true;
    this.error = null;
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
      this.error = `Failed to load orders: ${err.message}`;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async handleDelete(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      await apiService.deleteOrder(orderId);
      this.orders = this.orders.filter(order => order.id !== orderId);
    } catch (err) {
      this.error = `Failed to delete order: ${err.message}`;
      console.error(err);
    }
  }

  handleViewDetails(orderId) {
    const event = new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: { path: `/orders/${orderId}` }
    });
    this.dispatchEvent(event);
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
        <div class="empty-message">
          <p>No orders found.</p>
          <button @click=${() => this.dispatchEvent(new CustomEvent('navigate', {
            bubbles: true,
            composed: true,
            detail: { path: '/create-order' }
          }))}>Create New Order</button>
        </div>
      `;
    }

    return html`
      <div>
        <h3>Orders</h3>
        <button @click=${() => this.dispatchEvent(new CustomEvent('navigate', {
          bubbles: true,
          composed: true,
          detail: { path: '/create-order' }
        }))}>Create New Order</button>
        
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
                  <button @click=${() => this.handleViewDetails(order.id)}>View</button>
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
