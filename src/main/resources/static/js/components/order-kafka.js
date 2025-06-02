import { LitElement, html, css } from 'lit';
import { apiService } from '../services/api-service.js';

export class OrderKafka extends LitElement {
  static get properties() {
    return {
      order: { type: Object },
      loading: { type: Boolean },
      error: { type: String },
      success: { type: Boolean }
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
        margin-bottom: 1rem;
      }

      button:hover {
        opacity: 0.9;
      }

      button.btn-danger {
        background-color: var(--error-color, #dc3545);
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

      .success-message {
        color: var(--success-color);
        padding: 1rem;
        border: 1px solid var(--success-color);
        border-radius: 4px;
        margin-bottom: 1rem;
      }
    `;
  }

  constructor() {
    super();
    this.order = null;
    this.loading = false;
    this.error = null;
    this.success = false;
  }

  async getFromKafka() {
    try {
      this.loading = true;
      this.error = null;
      this.success = false;
      this.order = await apiService.getFromKafka();
      this.success = true;
    } catch (err) {
      console.error(err);

      if (err.data && err.data.message) {
        // Handle structured errors
        this.error = `Error: ${err.data.message}`;
      } else {
        // Fallback to generic error message
        this.error = `Failed to get order from Kafka: ${err.message}`;
      }
    } finally {
      this.loading = false;
    }
  }

  navigateToCreateOrder() {
    history.pushState({}, '', '/create-order');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  navigateToOrders() {
    history.pushState({}, '', '/orders');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <p>Loading order from Kafka...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error">
          <p>${this.error}</p>
          <button @click=${() => this.getFromKafka()}>Retry</button>
        </div>
      `;
    }

    return html`
      <div>
        <h3>Orders from Kafka</h3>
        <p>Click the button below to get the latest order from Kafka.</p>
        <button @click=${() => this.getFromKafka()}>Get from Kafka</button>
        <button @click=${this.navigateToOrders}>View All Orders</button>
        <button @click=${this.navigateToCreateOrder}>Create New Order</button>

        ${this.success ? html`
          <div class="success-message">
            <p>Order from kafka retrieved successfully!</p>
          </div>
        ` : ''}

        ${this.order ? html`
          <table class="order-list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Created At</th>
                <th>Status</th>
                <th>User ID</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${this.order.id}</td>
                <td>${new Date(this.order.createdAt).toLocaleString()}</td>
                <td>
                  <span class="status-badge status-${this.order.status}">
                    ${this.order.status}
                  </span>
                </td>
                <td>${this.order.userId}</td>
                <td>${this.order.description}</td>
              </tr>
            </tbody>
          </table>
        ` : html`
          <div class="empty-message">
            <p>No orders from Kafka yet. Click the "Get from Kafka" button to retrieve an order.</p>
          </div>
        `}
      </div>
    `;
  }
}

customElements.define('order-kafka', OrderKafka);
