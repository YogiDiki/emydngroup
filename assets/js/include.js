async function loadPartials() {
  const header = await fetch("/partials/header.html");
  const headerText = await header.text();
  document.getElementById("header").innerHTML = headerText;

  const footer = await fetch("/partials/footer.html");
  const footerText = await footer.text();
  document.getElementById("footer").innerHTML = footerText;
}

document.addEventListener("DOMContentLoaded", loadPartials);
