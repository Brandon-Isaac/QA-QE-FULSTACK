import { renderBooks } from "./bookRenderer";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("filterGenre")!
    .addEventListener("change", renderBooks);
  renderBooks();
});
