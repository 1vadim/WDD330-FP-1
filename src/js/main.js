import ExternalServices from "./ExternalServices.mjs";
import RoutePlanner from "./RoutePlanner.mjs";
import MapManager from "./MapManager.mjs";
import Favorites from "./Favorites.mjs";
import BikeStations from "./BikeStations.mjs";
import InfrastructureManager from "./InfrastructureManager.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const services = new ExternalServices();
const mapManager = new MapManager("map");
const planner = new RoutePlanner(services, mapManager);
const favorites = new Favorites();
const bikeStations = new BikeStations(services, mapManager);
const infrastructure = new InfrastructureManager(mapManager);

document.querySelector("#searchBtn").addEventListener("click", searchRoute);
document.querySelector("#saveBtn").addEventListener("click", saveRoute);

let currentRoute = null;
let currentRouteName = "";

function calculateDistanceBetweenCoords(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function searchRoute() {
  const startText = document.querySelector("#startLocation").value.trim();
  const endText = document.querySelector("#endLocation").value.trim();

  if (!startText || !endText) {
    alert("Please enter both start and destination locations.");
    return;
  }

  const searchBtn = document.querySelector("#searchBtn");
  searchBtn.disabled = true;
  searchBtn.textContent = "Searching...";

  try {
    console.log("1. Requesting coordinate search...");
    const start = await services.searchLocation(startText);
    const end = await services.searchLocation(endText);
    console.log("Nominatim Response (Start):", start);

    if (!start || !start.length || !end || !end.length) {
      alert(
        "One or both locations could not be found. Please try different names."
      );
      return;
    }

    const startLat = Number(start[0].lat);
    const startLon = Number(start[0].lon);
    const endLat = Number(end[0].lat);
    const endLon = Number(end[0].lon);

    console.log("2. Requesting route from OpenRouteService...");
    const routeResult = await planner.generateRoute(
      [startLon, startLat],
      [endLon, endLat]
    );
    console.log("ORS Response:", routeResult);

    if (!routeResult) {
      alert("Could not calculate a cycling route between these locations.");
      resetUI();
      return;
    }

    currentRoute = routeResult;
    currentRouteName = `${start[0].display_name} → ${end[0].display_name}`;
    document.querySelector("#routeName").textContent = currentRouteName;
    document.querySelector("#distance").textContent =
      `${currentRoute.distance} km`;
    document.querySelector("#duration").textContent =
      `${currentRoute.duration} min`;
    document.querySelector("#difficulty").textContent = calculateDifficulty(
      currentRoute.distance
    );

    console.log("3. Request for infrastructure around the start...");
    try {
      const infrastructureData = await services.getInfrastructure(
        startLat,
        startLon
      );
      if (infrastructureData && infrastructureData.elements) {
        infrastructure.renderInfrastructure(infrastructureData.elements);
      }
    } catch (e) {
      console.error(
        "Error occurred while fetching infrastructure (Overpass), but continuing:",
        e
      );
    }

    console.log("4. Request for rental stations...");

let allStations = [];
try {
  allStations = await services.getBikeStations();
} catch (e) {
  console.error(
    "Error occurred while fetching bike stations, but continuing:",
    e
  );
}

if (Array.isArray(allStations) && allStations.length > 0) {
  console.log("5. Sorting stations...");

  const sortedStations = allStations.sort((stationA, stationB) => {
    const latA = stationA.location?.latitude || stationA.latitude || 0;
    const lonA = stationA.location?.longitude || stationA.longitude || 0;
    const latB = stationB.location?.latitude || stationB.latitude || 0;
    const lonB = stationB.location?.longitude || stationB.longitude || 0;

    const distA = calculateDistanceBetweenCoords(
      startLat,
      startLon,
      Number(latA),
      Number(lonA)
    );
    const distB = calculateDistanceBetweenCoords(
      startLat,
      startLon,
      Number(latB),
      Number(lonB)
    );
    return distA - distB;
  });

  const closestStationsForMap = sortedStations.slice(0, 15);

  closestStationsForMap.forEach((station) => {
    mapManager.addStation(station);
  });

  const closestStationsForList = sortedStations.slice(0, 5);
  infrastructure.renderRentalStations(closestStationsForList);
} else {
  console.log(
    "No stations were found or the API returned an invalid response."
  );
}
  } catch (error) {
    console.error("CRITICAL ERROR during the whole process:", error);
    alert("An unexpected error occurred. Please check console for details.");
  } finally {
    console.log("The process is complete, the button is unlocked.");
    searchBtn.disabled = false;
    searchBtn.textContent = "Generate Route";
  }
}

function resetUI() {
  document.querySelector("#routeName").textContent = "-";
  document.querySelector("#distance").textContent = "-";
  document.querySelector("#duration").textContent = "-";
  document.querySelector("#difficulty").textContent = "-";
  currentRoute = null;
}

function saveRoute() {
  if (!currentRoute) return;

  favorites.addRoute({
    routeName: currentRouteName,
    distance: currentRoute.distance,
    duration: currentRoute.duration,
    difficulty: calculateDifficulty(currentRoute.distance),
    created: new Date().toLocaleDateString(),
  });

  alert("Route saved");
}

function calculateDifficulty(distance) {
  const km = Number(distance);
  if (km < 15) return "Easy";
  if (km < 40) return "Medium";
  return "Hard";
}

const rentalFilter = document.querySelector("#rentalFilter");
const repairFilter = document.querySelector("#repairFilter");

rentalFilter.addEventListener("click", () => {
  document
    .querySelector(".info-section:nth-child(1)")
    .classList.toggle("hidden");
  rentalFilter.classList.toggle("active");
});

repairFilter.addEventListener("click", () => {
  document
    .querySelector(".info-section:nth-child(2)")
    .classList.toggle("hidden");
  repairFilter.classList.toggle("active");
});
