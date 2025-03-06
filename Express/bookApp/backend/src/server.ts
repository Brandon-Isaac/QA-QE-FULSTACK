import express, { Response, Request } from "express";
import cors from "cors";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  price: number;
  description: string;
  image: string;
}

const booksFilePath = path.join(__dirname, "db/books.json");
const books: Book[] = JSON.parse(fs.readFileSync(booksFilePath, "utf-8")).Books;

app.use(cors());
app.use(express.json());

app.get("/api/books", (req: Request, res: Response) => {
  let filteredBooks = books;

  if (req.query.genre) {
    filteredBooks = filteredBooks.filter(
      (book) => book.genre === req.query.genre
    );
  }

  if (req.query.search) {
    const searchQuery = req.query.search.toString().toLowerCase();
    filteredBooks = filteredBooks.filter((book) =>
      book.title.toLowerCase().includes(searchQuery)
    );
  }

  if (req.query.sortBy) {
    const sortBy = req.query.sortBy.toString();
    if (sortBy === "year") {
      filteredBooks.sort((a, b) => a.year - b.year);
    } else if (sortBy === "pages") {
      filteredBooks.sort((a, b) => a.pages - b.pages);
    }
  }

  res.json(filteredBooks);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
