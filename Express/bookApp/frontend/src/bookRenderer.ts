import { fetchBooks } from "./api";

export const renderBooks = async () => {
  const bookList = document.getElementById("bookList")!;
  bookList.innerHTML = "";

  const genre = (document.getElementById("filterGenre") as HTMLSelectElement)
    .value;
  const books = await fetchBooks(genre ? `?genre=${genre}` : "");

  books.forEach((book: any) => {
    const div = document.createElement("div");
    div.classList.add("book");
    div.innerHTML = `<h2>${book.title}</h2><p>${book.author}</p><p>${book.year}</p>`;
    bookList.appendChild(div);
  });
};
