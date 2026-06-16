export default class InfrastructureManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.rentalStations = document.querySelector("#rentalStations");
    this.repairStations = document.querySelector("#repairStations");
    this.nearbyServices = document.querySelector("#nearbyServices");
  }

  renderRentalStations(stations) {
    this.rentalStations.innerHTML = stations
      .slice(0, 10)
      .map((station) => `<li>${station.name}</li>`)
      .join("");
  }

  renderInfrastructure(elements) {
    const repairs = elements.filter(
      (element) => element.tags?.amenity === "bicycle_repair_station"
    );

    const services = elements.filter(
      (element) => element.tags?.shop === "bicycle"
    );

    elements.forEach((item) => {
      if (item.lat && item.lon) {
        this.mapManager.addInfrastructureMarker(
          item.lat,
          item.lon,
          item.tags?.name || "Infrastructure",
          item.tags?.amenity || item.tags?.shop
        );
      }
    });

    this.repairStations.innerHTML = repairs.length
      ? repairs
          .slice(0, 10)
          .map(
            (repair) => `
                        <li>
                            ${repair.tags.name || "Repair Station"}
                        </li>
                    `
          )
          .join("")
      : "<li>No repair stations found</li>";

    this.nearbyServices.innerHTML = services.length
      ? services
          .slice(0, 10)
          .map(
            (service) => `
                        <li>
                            ${service.tags.name || "Bike Shop"}
                        </li>
                    `
          )
          .join("")
      : "<li>No nearby services found</li>";
  }
}
