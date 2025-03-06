import * as fs from "fs";
import * as path from "path";

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
}

const booksFilePath = path.join(__dirname, ".src/db/books.json");
const books: Book[] = JSON.parse(fs.readFileSync(booksFilePath, "utf-8"));

export const getBooks = (query: any): Book[] => {
  let filteredBooks = books;

  if (query.genre)
    filteredBooks = filteredBooks.filter((book) => book.genre === query.genre);
  if (query.year)
    filteredBooks = filteredBooks.filter(
      (book) => book.year == parseInt(query.year)
    );
  if (query.pages)
    filteredBooks = filteredBooks.filter(
      (book) => book.pages == parseInt(query.pages)
    );

  if (query.sort === "year") filteredBooks.sort((a, b) => a.year - b.year);
  if (query.sort === "pages") filteredBooks.sort((a, b) => a.pages - b.pages);

  return filteredBooks;
};
