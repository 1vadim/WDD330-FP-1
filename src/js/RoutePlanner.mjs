export default class RoutePlanner {
  constructor(services, mapManager) {
    this.services = services;
    this.mapManager = mapManager;
  }

  async generateRoute(start, end) {
    const route = await this.services.getRoute(start, end);

    if (!route || !route.features || route.features.length === 0) {
      return null;
    }

    const feature = route.features[0];
    const summary = feature.properties.summary;

    const coordinates = feature.geometry.coordinates.map((point) => [
      point[1],
      point[0],
    ]);

    this.mapManager.drawRoute(coordinates);

    return {
      distance: (summary.distance / 1000).toFixed(2),
      duration: (summary.duration / 60).toFixed(0),
      coordinates,
    };
  }
}
