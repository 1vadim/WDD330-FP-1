const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export default class ExternalServices {
  async searchLocation(query) {
    if (!query) return [];

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "EuroCycleRoutePlanner/1.0",
        },
      });

      if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error searching location:", error);
      return [];
    }
  }

  async getRoute(startCoords, endCoords) {
    if (!ORS_API_KEY) {
      console.error("Critical error: OpenRouteService API key missing!");
      return null;
    }

    const url =
      "https://api.openrouteservice.org/v2/directions/cycling-regular/geojson";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: ORS_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json",
        },
        body: JSON.stringify({
          coordinates: [startCoords, endCoords],
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`ORS server error ${response.status}: ${errorDetails}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  }

  async getBikeStations() {
    const url = "https://api.citybik.es/v2/networks";

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`CityBikes error: ${response.status}`);

      const data = await response.json();
      return data.networks || [];
    } catch (error) {
      console.error("Error fetching bike stations:", error);
      return [];
    }
  }

  async getInfrastructure(lat, lon) {
    const query = `[out:json];(node["shop"="bicycle"](around:5000,${lat},${lon});node["amenity"="bicycle_repair_station"](around:5000,${lat},${lon});node["amenity"="bicycle_parking"](around:5000,${lat},${lon}););out;`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      if (!response.ok) throw new Error(`Overpass error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching infrastructure:", error);
      return { elements: [] };
    }
  }
}
