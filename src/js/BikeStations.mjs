export default class BikeStations {
  constructor(services, mapManager) {
    this.services = services;

    this.mapManager = mapManager;
  }

  async renderStations() {
    const stations = await this.services.getBikeStations();

    stations.slice(0, 20).forEach((station) => {
      this.mapManager.addStation(station);
    });
  }
}
