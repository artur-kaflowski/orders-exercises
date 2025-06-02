import { LitElement, html, css } from 'lit';

export class HomePage extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }

      .home-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .welcome-section {
        text-align: center;
        margin-bottom: 2rem;
      }

      h2 {
        color: var(--secondary-color);
        margin-bottom: 1rem;
      }

      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .feature-card {
        padding: 1.5rem;
        border-radius: 8px;
        background-color: var(--light-color);
        border-left: 4px solid var(--primary-color);
        cursor: pointer;
        transition: transform 0.2s ease, background-color 0.2s ease;
      }

      .feature-card:hover {
        background-color: #e0f0ff;
        transform: scale(1.02);
      }

      .feature-card h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
      }
    `;
  }

  handleNavigate(path) {
    history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    return html`
      <div class="home-container">
        <div class="welcome-section">
          <h2>Welcome to the Orders Exercise page</h2>
        </div>

        <div class="features">
          <div class="feature-card" @click=${() => this.handleNavigate('/orders')}>
            <h3>View All Orders</h3>
            <p>Browse and search through all your orders.</p>
          </div>

          <div class="feature-card" @click=${() => this.handleNavigate('/create-order')}>
            <h3>Create Orders</h3>
            <p>Easily create new orders.</p>
          </div>

          <div class="feature-card" @click=${() => this.handleNavigate('/orders-from-kafka')}>
            <h3>Orders Kafka</h3>
            <p>Get order from Kafka queue</p>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('home-page', HomePage);
