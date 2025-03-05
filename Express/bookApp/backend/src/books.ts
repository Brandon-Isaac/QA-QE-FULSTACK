export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
}

const books: Book[] = [
  {
    id: 1,
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian",
    year: 1949,
    pages: 328,
  },
  {
    id: 2,
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    year: 1937,
    pages: 310,
  },
  {
    id: 3,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    year: 1813,
    pages: 432,
  },
];

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
