export class Router {
  constructor(outlet) {
    this.outlet = outlet;
    this.routes = new Map();

    window.addEventListener('popstate', () => this.handleLocation());
  }


  addRoute(path, componentName, importFunc) {
    this.routes.set(path, { componentName, importFunc });
  }

  navigate(path, params = {}) {
    window.history.pushState(params, '', path);
    this.handleLocation();
  }

  start() {
    this.handleLocation();
  }

  async handleLocation() {
    const path = window.location.pathname;
    let matchedRoute = null;
    let routeParams = {};

    for (const [routePath, routeInfo] of this.routes.entries()) {
      const match = this.matchRoute(path, routePath);
      if (match) {
        matchedRoute = routeInfo;
        routeParams = match.params;
        break;
      }
    }

    if (!matchedRoute && this.routes.has('/')) {
      matchedRoute = this.routes.get('/');
    }

    if (matchedRoute) {
      await matchedRoute.importFunc();

      while (this.outlet.firstChild) {
        this.outlet.removeChild(this.outlet.firstChild);
      }

      const component = document.createElement(matchedRoute.componentName);

      Object.entries(routeParams).forEach(([key, value]) => {
        component[key] = value;
      });

      if (window.history.state) {
        Object.entries(window.history.state).forEach(([key, value]) => {
          component[key] = value;
        });
      }
      
      this.outlet.appendChild(component);
      this.currentComponent = component;
    }
  }

  matchRoute(path, routePath) {

    const pathSegments = path.split('/').filter(segment => segment !== '');
    const routeSegments = routePath.split('/').filter(segment => segment !== '');

    if (pathSegments.length !== routeSegments.length) {
      return null;
    }
    
    const params = {};

    for (let i = 0; i < routeSegments.length; i++) {
      const routeSegment = routeSegments[i];
      const pathSegment = pathSegments[i];

      if (routeSegment.startsWith(':')) {
        const paramName = routeSegment.substring(1);
        params[paramName] = pathSegment;
      } 

      else if (routeSegment !== pathSegment) {
        return null;
      }
    }
    
    return { params };
  }
}
