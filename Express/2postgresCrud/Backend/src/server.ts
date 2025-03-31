import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function connectClient(): Promise<void> {
  try {
    await pool.connect();
    console.log("Connected to the database.");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

connectClient();

interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  publisher: string;
  description: string;
  image: string;
  price: number;
}

// GET all books
app.get("/books", async (req: Request, res: Response) => {
  try {
    const books = await getBooksFromDatabase();
    const filteredBooks = filterBooks(books, req.query);
    res.json(filteredBooks);
  } catch (err) {
    console.error("Error getting books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const getBooksFromDatabase = async (): Promise<Book[]> => {
  const result = await pool.query<Book>(
    "SELECT * FROM public.books ORDER BY id ASC"
  );
  return result.rows;
};

const filterBooks = (books: Book[], query: any): Book[] => {
  let filteredBooks = [...books];

  if (query.search) {
    filteredBooks = filterBySearch(filteredBooks, query.search);
  }

  if (query.genre) {
    filteredBooks = filterByGenre(filteredBooks, query.genre);
  }

  if (query.sortBy) {
    filteredBooks = sortByField(filteredBooks, query.sortBy);
  }

  return filteredBooks;
};

const filterBySearch = (books: Book[], search: string): Book[] => {
  const searchTerm = search.toLowerCase().trim();
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.description.toLowerCase().includes(searchTerm)
  );
};

const filterByGenre = (books: Book[], genre: string): Book[] => {
  return books.filter(
    (book) => book.genre.toLowerCase() === genre.toLowerCase()
  );
};

const sortByField = (books: Book[], sortBy: string): Book[] => {
  if (sortBy === "year") {
    return books.sort((a, b) => a.year - b.year);
  } else if (sortBy === "title") {
    return books.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "author") {
    return books.sort((a, b) => a.author.localeCompare(b.author));
  }
  return books;
};

// GET a specific book
app.get("/books/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<Book>(
      "SELECT * FROM public.books WHERE id = $1",
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Book not found" });
    }
  } catch (err) {
    console.error("Error getting book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST (Create) a new book
app.post("/books", async (req: Request, res: Response) => {
  const {
    id,
    title,
    author,
    genre,
    year,
    pages,
    publisher,
    description,
    image,
    price,
  } = req.body;
  try {
    await pool.query<Book>(
      `
      INSERT INTO public.books (id, title, author, genre, year, pages, publisher, description, image, price)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
      [
        id,
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
        image,
        price,
      ]
    );
    res.status(201).json({ message: "Book created successfully" });
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT (Replace) an existing book
app.put("/books/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    author,
    genre,
    year,
    pages,
    publisher,
    description,
    image,
    price,
  } = req.body;
  try {
    await pool.query(
      `
      UPDATE public.books
      SET title = $1, author = $2, genre = $3, year = $4, pages = $5, publisher = $6, description = $7, image = $8, price = $9
      WHERE id = $10
      `,
      [
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
        image,
        price,
        id,
      ]
    );
    res.json({ message: "Book updated successfully" });
  } catch (err) {
    console.error("Error updating book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH (Partial update) an existing book
app.patch("/books/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    let query = "UPDATE public.books SET ";
    const values: any[] = [];
    let index = 1;

    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        query += `${key} = $${index}, `;
        values.push(updates[key]);
        index++;
      }
    }

    query = query.slice(0, -2);
    query += ` WHERE id = $${index}`;
    values.push(id);

    await pool.query(query, values);
    res.json({ message: "Book partially updated successfully" });
  } catch (err) {
    console.error("Error partially updating book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE a book
app.delete("/books/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM public.books WHERE id = $1", [id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
