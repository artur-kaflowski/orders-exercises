import { LitElement, html, css } from 'lit';
import { apiService } from '../services/api-service.js';

export class OrderDetail extends LitElement {
  static get properties() {
    return {
      id: { type: String },
      order: { type: Object },
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
      
      .order-detail {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
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
      
      .detail-row {
        display: flex;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
      }
      
      .detail-label {
        font-weight: bold;
        width: 150px;
      }
      
      .detail-value {
        flex: 1;
      }
      
      .actions {
        margin-top: 1.5rem;
        display: flex;
        gap: 1rem;
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
    this.order = null;
    this.loading = true;
    this.error = null;
  }

  updated(changedProperties) {
    if (changedProperties.has('id') && this.id) {
      this.loadOrder();
    }
  }

  async loadOrder() {
    if (!this.id) return;
    
    try {
      this.loading = true;
      this.order = await apiService.getOrder(this.id);
    } catch (err) {
      this.error = `Failed to load order: ${err.message}`;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  handleBack() {
    const event = new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: { path: '/orders' }
    });
    this.dispatchEvent(event);
  }

  async handleDelete() {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }
    
    try {
      await apiService.deleteOrder(this.id);
      this.handleBack();
    } catch (err) {
      this.error = `Failed to delete order: ${err.message}`;
      console.error(err);
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <p>Loading order details...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error">
          <p>${this.error}</p>
          <button @click=${() => this.loadOrder()}>Retry</button>
          <button @click=${this.handleBack}>Back to Orders</button>
        </div>
      `;
    }

    if (!this.order) {
      return html`
        <div class="error">
          <p>Order not found</p>
          <button @click=${this.handleBack}>Back to Orders</button>
        </div>
      `;
    }

    return html`
      <div class="order-detail">
        <h3>Order Details</h3>
        
        <div class="detail-row">
          <div class="detail-label">ID:</div>
          <div class="detail-value">${this.order.id}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Created At:</div>
          <div class="detail-value">${new Date(this.order.createdAt).toLocaleString()}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Status:</div>
          <div class="detail-value">
            <span class="status-badge status-${this.order.status}">
              ${this.order.status}
            </span>
          </div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">User ID:</div>
          <div class="detail-value">${this.order.userId}</div>
        </div>
        
        <div class="detail-row">
          <div class="detail-label">Description:</div>
          <div class="detail-value">${this.order.description}</div>
        </div>
        
        <div class="actions">
          <button @click=${this.handleBack}>Back to Orders</button>
          <button class="btn-danger" @click=${this.handleDelete}>Delete Order</button>
        </div>
      </div>
    `;
  }
}

customElements.define('order-detail', OrderDetail);
