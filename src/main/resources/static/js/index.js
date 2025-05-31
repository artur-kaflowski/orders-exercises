import { Router } from './router.js';
import './components/app-container.js';
import './components/order-list.js';
import './components/order-detail.js';
import './components/order-form.js';

// Initialize the router
const router = new Router(document.getElementById('outlet'));

// Define routes
router.addRoute('/', 'home-page', () => import('./pages/home-page.js'));
router.addRoute('/orders', 'order-list', () => import('./components/order-list.js'));
router.addRoute('/orders/:id', 'order-detail', () => import('./components/order-detail.js'));
router.addRoute('/create-order', 'order-form', () => import('./components/order-form.js'));

router.start();

document.getElementById('home-link').addEventListener('click', (e) => {
  e.preventDefault();
  router.navigate('/');
});

document.getElementById('orders-link').addEventListener('click', (e) => {
  e.preventDefault();
  router.navigate('/orders');
});

document.getElementById('create-order-link').addEventListener('click', (e) => {
  e.preventDefault();
  router.navigate('/create-order');
});

