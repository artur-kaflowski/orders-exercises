import { Router } from './router.js';
import './components/app-container.js';
import './components/order-list.js';
import './components/order-form.js';
import './components/order-kafka.js';

const router = new Router(document.getElementById('outlet'));

router.addRoute('/', 'home-page', () => import('./pages/home-page.js'));
router.addRoute('/orders', 'order-list', () => import('./components/order-list.js'));
router.addRoute('/create-order', 'order-form', () => import('./components/order-form.js'));
router.addRoute('/orders-from-kafka', 'order-kafka', () => import('./components/order-kafka.js'));

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

document.getElementById('orders-kafka-link').addEventListener('click', (e) => {
  e.preventDefault();
  router.navigate('/orders-from-kafka');
});
