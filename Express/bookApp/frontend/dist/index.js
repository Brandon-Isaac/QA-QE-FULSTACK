"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookRenderer_1 = require("./bookRenderer");
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("filterGenre")
        .addEventListener("change", bookRenderer_1.renderBooks);
    (0, bookRenderer_1.renderBooks)();
});
