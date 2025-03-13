import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middlewares/asyncHandler";

export const getAllBooks = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.books ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.books WHERE id = $1",
      [id]
    );
    result.rows.length > 0
      ? res.json(result.rows[0])
      : res.status(404).json({ error: "Book not found" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
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
    await pool.query(
      `INSERT INTO public.books (title, author, genre, year, pages, publisher, description, image, price) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [title, author, genre, year, pages, publisher, description, image, price]
    );
    res.status(201).json({ message: "Book created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateBook = async (req: Request, res: Response) => {
  try {
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
    await pool.query(
      `UPDATE public.books SET title = $1, author = $2, genre = $3, year = $4, pages = $5, publisher = $6, description = $7, image = $8, price = $9 WHERE id = $10`,
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
};

export const partialUpdateBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
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
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM public.books WHERE id = $1", [id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
