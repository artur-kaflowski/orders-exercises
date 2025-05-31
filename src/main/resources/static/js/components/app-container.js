import { LitElement, html, css } from 'lit';

export class AppContainer extends LitElement {
  static get properties() {
    return {
      title: { type: String }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        width: 100%;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 1rem;
      }
      
      h2 {
        color: var(--secondary-color);
        margin-bottom: 1rem;
      }
    `;
  }

  constructor() {
    super();
    this.title = 'Orders Exercises';
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('App initialized');
  }

  render() {
    return html`
      <div class="container">
        <h2>${this.title}</h2>
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('app-container', AppContainer);
