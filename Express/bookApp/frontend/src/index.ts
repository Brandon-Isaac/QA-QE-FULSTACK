export const fetchBooks = async (filter: string = "") => {
  const response = await fetch(`http://localhost:5000/api/books${filter}`);
  return response.json();
};
const renderBooks = async () => {
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

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("filterGenre")!
    .addEventListener("change", renderBooks);
  renderBooks();
});
