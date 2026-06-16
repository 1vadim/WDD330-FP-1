import L from "leaflet";

export default class MapManager {
  constructor(mapId) {
    this.map = L.map(mapId).setView([48.2082, 16.3738], 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(this.map);

    this.routeLayer = null;
  }

  drawRoute(coords) {
    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }

    this.routeLayer = L.polyline(coords, {
      color: "blue",
      weight: 5,
    }).addTo(this.map);

    this.map.fitBounds(this.routeLayer.getBounds());
  }

  addStation(station) {
    if (!station.location || !station.location.latitude) {
      return;
    }

    L.marker([station.location.latitude, station.location.longitude])
      .addTo(this.map)
      .bindPopup(station.name);
  }
  addInfrastructureMarker(lat, lon, title, type) {
    let iconText = "🚴";

    if (type === "bicycle_repair_station") {
      iconText = "🔧";
    }

    if (type === "bicycle") {
      iconText = "🏪";
    }

    L.marker([lat, lon]).addTo(this.map).bindPopup(`${iconText} ${title}`);
  }
}
