import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";
import { Book } from "../utils/interface";
import { UserRequest } from "../utils/interface";

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query<Book>(
      "SELECT * FROM public.books ORDER BY book_id ASC"
    );
    const books = result.rows;

    const { search, genre, sortBy } = req.query;

    let filteredBooks = [...books];

    if (search) {
      const searchTerm = (search as string).toLowerCase().trim();
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.description.toLowerCase().includes(searchTerm)
      );
    }

    if (genre) {
      filteredBooks = filteredBooks.filter(
        (book) => book.genre.toLowerCase() === (genre as string).toLowerCase()
      );
    }

    if (sortBy === "year") {
      filteredBooks.sort((a, b) => a.year - b.year);
    } else if (sortBy === "title") {
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "author") {
      filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
    }

    const stats = {
      totalBooks: filteredBooks.length,
      avgPages: filteredBooks.length
        ? Math.round(
            filteredBooks.reduce((sum, book) => sum + book.pages, 0) /
              filteredBooks.length
          )
        : 0,
      oldestBook: filteredBooks.length
        ? Math.min(...filteredBooks.map((book) => book.year))
        : null,
      uniqueGenres: new Set(filteredBooks.map((book) => book.genre)).size,
    };

    res.json(filteredBooks);
  } catch (err) {
    console.error("Error getting books:", err);
    res.status(500).json({ error: "Internal server error" });
    console.error("Error filtering books:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getBookById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = (req as unknown as Request).params;
  try {
    const result = await pool.query<Book>(
      "SELECT * FROM public.books WHERE book_id = $1",
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

export const createBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    const {
      title,
      author,
      genre,
      year,
      pages,
      publisher,
      description,
      available_copies,
      total_copies,
      image,
      price,
    } = req.body as unknown as Book;
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }

      if (req.user.role_id !== 1 && req.user.role_id !== 2) {
        res.status(403).json({
          message: "Access denied: Only Librarians or Admins can create books",
        });
        return;
      }
      await pool.query(
        `INSERT INTO public.books (title, author, genre, year, pages, publisher, description, available_copies,total_copies,image, price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11)`,
        [
          title,
          author,
          genre,
          year,
          pages,
          publisher,
          description,
          available_copies,
          total_copies,
          image,
          price,
        ]
      );
      res.status(201).json({ message: "Book created successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const updateBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { id } = (req as unknown as Request).params;
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
      } = req.body as unknown as Book;
      if (!req.user) {
        res.status(401).json({ message: "Not authorized" });
        return;
      }
      if (req.user.role_id !== 1 && req.user.role_id !== 2) {
        res.status(403).json({
          message: "Access denied: Only Librarians or Admins can update books",
        });
        return;
      }
      await pool.query(
        `UPDATE public.books SET title = $1, author = $2, genre = $3, year = $4, pages = $5, publisher = $6, description = $7, image = $8, price = $9 WHERE book_id = $10`,
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
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const partialUpdateBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not Authorized" });
        return;
      }
      const { id } = (req as unknown as Request).params;
      const updates = req.body as Partial<Book>;
      if (req.user.role_id !== 1 && req.user.role_id !== 2) {
        res.status(403).json({
          message: "Access denied: Only Librarians or Admins can update books",
        });
        return;
      }
      let query = "UPDATE public.books SET ";
      const values: any[] = [];
      let index = 1;

      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          query += `${key} = $${index}, `;
          values.push(updates[key as keyof Book]);
          index++;
        }
      }

      query = query.slice(0, -2);
      query += ` WHERE book_id = $${index}`;
      values.push(id);

      await pool.query(query, values);
      res.json({ message: "Book partially updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const deleteBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not Authorized" });
        return;
      }
      const { id } = (req as unknown as Request).params;
      if (req.user.role_id !== 1) {
        res.status(403).json({
          message: "Access denied:  Admins can delete books",
        });
        return;
      }
      await pool.query("DELETE FROM public.books WHERE book_id = $1", [id]);
      res.json({ message: "Book deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
