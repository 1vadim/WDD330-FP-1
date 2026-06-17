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
    this.addInfrastructureMarker(
      station.location.latitude,
      station.location.longitude,
      station.name,
      "rental"
    );
  }

  addInfrastructureMarker(lat, lon, title, type) {
let iconText = "📍"; 

if (type === "bicycle_repair_station") {
  iconText = "🔧"; 
} else if (type === "bicycle") {
  iconText = "🏪"; 
} else if (type === "rental") {
  iconText = "🚴";
}

const emojiIcon = L.divIcon({
  html: `<div style="font-size: 24px; line-height: 1; text-align: center;">${iconText}</div>`,
  className: "custom-emoji-marker", 
  iconSize: [30, 30],
  iconAnchor: [15, 15], 
});

L.marker([lat, lon], { icon: emojiIcon })
  .addTo(this.map)
  .bindPopup(`<b>${title}</b><br>Type: ${type || "Unknown"}`);
  }
}
