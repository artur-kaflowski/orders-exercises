import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost/',
  referrer: 'http://localhost/',
  contentType: 'text/html',
  includeNodeLocations: true,
  storageQuota: 10000000,
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;

Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: false
});
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.ShadowRoot = dom.window.ShadowRoot;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.KeyboardEvent = dom.window.KeyboardEvent;

global.PopStateEvent = class PopStateEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.state = eventInitDict.state || null;
  }
};
global.DOMParser = dom.window.DOMParser;
global.Document = dom.window.Document;
global.DocumentFragment = dom.window.DocumentFragment;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.Element = dom.window.Element;
global.MutationObserver = dom.window.MutationObserver;

global.fetch = (url, options) => {
  console.log(`[DEBUG_LOG] Mock fetch called with URL: ${url}`);

  // Parse request body if it exists
  let requestBody = {};
  if (options && options.body) {
    try {
      requestBody = JSON.parse(options.body);
    } catch (e) {
      console.log(`[DEBUG_LOG] Could not parse request body: ${options.body}`);
    }
  }

  // Simulate validation errors for specific cases
  if (url.includes('/orders') && options && options.method === 'POST') {
    if (!requestBody.userId || !requestBody.description) {
      return Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Validation Error',
          message: 'Validation failed for the request',
          path: url,
          validationErrors: {
            ...(requestBody.userId ? {} : { userId: 'User ID cannot be null' }),
            ...(requestBody.description ? {} : { description: 'Description cannot be empty' })
          }
        }),
        text: () => Promise.resolve(''),
      });
    }
  }

  // Default success response
  return Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
};

global.URL = dom.window.URL;
global.URLSearchParams = dom.window.URLSearchParams;

global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;
global.FormData = dom.window.FormData;
