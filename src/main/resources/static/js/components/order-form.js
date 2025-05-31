import { LitElement, html, css } from 'lit';
import '@lion/form/define';
import '@lion/input/define';
import '@lion/button/define';
import { apiService } from '../services/api-service.js';
import { Required, MinLength, MinNumber } from '@lion/form-core';

export class OrderForm extends LitElement {
  static get properties() {
    return {
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

      .order-form {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        max-width: 600px;
      }

      .form-title {
        margin-bottom: 1.5rem;
        color: var(--secondary-color);
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .error-message {
        color: var(--error-color);
        padding: 1rem;
        border: 1px solid var(--error-color);
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      .success-message {
        color: var(--success-color);
        padding: 1rem;
        border: 1px solid var(--success-color);
        border-radius: 4px;
        margin-bottom: 1rem;
      }

      lion-input {
        margin-bottom: 1rem;
      }
    `;
  }

  constructor() {
    super();
    this.loading = false;
    this.error = null;
    this.success = false;
  }

  async handleSubmit(e) {
    e.preventDefault();

    const form = this.shadowRoot.querySelector('form');
    const formData = new FormData(form);

    const userId = formData.get('userId');
    const description = formData.get('description');

    // Basic validation (optional, lion-input should validate too)
    if (!userId || !description) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const orderData = {
      userId: parseInt(userId, 10),
      description
    };

    try {
      this.loading = true;
      this.error = null;
      this.success = false;

      await apiService.createOrder(orderData);

      form.reset();
      this.success = true;

      setTimeout(() => {
        const event = new CustomEvent('navigate', {
          bubbles: true,
          composed: true,
          detail: { path: '/orders' }
        });
        this.dispatchEvent(event);
      }, 2000);

    } catch (err) {
      this.error = `Failed to create order: ${err.message}`;
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  handleCancel() {
    history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    return html`
      <div class="order-form">
        <h3 class="form-title">Create New Order</h3>

        ${this.error ? html`
          <div class="error-message">
            <p>${this.error}</p>
          </div>
        ` : ''}

        ${this.success ? html`
          <div class="success-message">
            <p>Order created successfully! Redirecting to orders list...</p>
          </div>
        ` : ''}

        <lion-form @submit=${this.handleSubmit}>
          <form>
            <lion-input
                name="userId"
                label="User ID"
                type="number"
                min="1"
                required
                .validators="${[
                  new Required({ message: 'User ID is required' }),
                  new MinNumber({ minNumber: 1, message: 'User ID must be a positive number' })
                ]}"
            ></lion-input>

            <lion-input
                name="description"
                label="Description"
                required
                .validators="${[
                  new Required({ message: 'Description is required' }),
                  new MinLength({ minLength: 3, message: 'Description must be at least 3 characters' })
                ]}"
            ></lion-input>

            <div class="form-actions">
              <lion-button type="submit" ?disabled=${this.loading}>
                ${this.loading ? 'Creating...' : 'Create Order'}
              </lion-button>
              <lion-button @click=${this.handleCancel} ?disabled=${this.loading}>
                Cancel
              </lion-button>
            </div>
          </form>
        </lion-form>
      </div>
    `;
  }
}

customElements.define('order-form', OrderForm);
