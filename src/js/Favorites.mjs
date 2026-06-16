import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const STORAGE_KEY = "eurocycle-favorites";

export default class Favorites {
  getRoutes() {
    return getLocalStorage(STORAGE_KEY) || [];
  }

  addRoute(route) {
    const routes = this.getRoutes();

    routes.push(route);

    setLocalStorage(STORAGE_KEY, routes);
  }

  removeRoute(index) {
    const routes = this.getRoutes();

    routes.splice(index, 1);

    setLocalStorage(STORAGE_KEY, routes);
  }
}
