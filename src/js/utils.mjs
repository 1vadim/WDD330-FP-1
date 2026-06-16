export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function loadHeaderFooter() {
  const headerResponse = await fetch("/public/partials/header.html");

  const footerResponse = await fetch("/public/partials/footer.html");

  document.querySelector("#main-header").innerHTML =
    await headerResponse.text();

  document.querySelector("#main-footer").innerHTML =
    await footerResponse.text();
}
