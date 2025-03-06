var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const fetchBooks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filter = "") {
    const response = yield fetch(`http://localhost:5000/api/books${filter}`);
    return response.json();
});
const renderBooks = () => __awaiter(void 0, void 0, void 0, function* () {
    const bookList = document.getElementById("bookList");
    bookList.innerHTML = "";
    const genre = document.getElementById("filterGenre")
        .value;
    const books = yield fetchBooks(genre ? `?genre=${genre}` : "");
    books.forEach((book) => {
        const div = document.createElement("div");
        div.classList.add("book");
        div.innerHTML = `<h2>${book.title}</h2><p>${book.author}</p><p>${book.year}</p>`;
        bookList.appendChild(div);
    });
});
document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("filterGenre")
        .addEventListener("change", renderBooks);
    renderBooks();
});
//# sourceMappingURL=index.js.map