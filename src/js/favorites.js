import Favorites from "./Favorites.mjs";
import { loadHeaderFooter } from "./utils.mjs";

loadHeaderFooter();

const favorites = new Favorites();

renderFavorites();

function renderFavorites() {
  const container = document.querySelector("#favoritesContainer");

  const routes = favorites.getRoutes();

  if (!routes.length) {
    container.innerHTML = "<p>No saved routes</p>";

    return;
  }

  container.innerHTML = routes
    .map(
      (route, index) => `
          <div class="route-card">
            <h3>
              ${route.routeName}
            </h3>

            <p>
              Distance:
              ${route.distance} km
            </p>

            <p>
              Duration:
              ${route.duration} min
            </p>

            <p>
  Difficulty:
  ${route.difficulty}
</p>

            <button id="btn-danger" class="btn"
              data-index="${index}"
            >
              Delete
            </button>
          </div>
        `
    )
    .join("");

  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      favorites.removeRoute(Number(e.target.dataset.index));

      renderFavorites();
    });
  });
}
