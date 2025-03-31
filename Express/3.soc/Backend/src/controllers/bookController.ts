import { Response } from "express";
import pool from "@app/db/db.config";
import { UserRequest } from "@app/utils/types/userTypes";
import asyncHandler from "@app/middleware/asyncHandler";

/**
 * @desc Create a book
 * @route POST /api/v1/books
 * @access Librarian or Admin Only
 */
export const createBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    console.log("createBook function called");
    console.log("Request user:", req.user);

    try {
      // Extract user_id from the authenticated user's token
      if (!req.user) {
        console.log("No user found in request");
        return res.status(401).json({ message: "Not authorized" });
      }

      const user_id = req.user.id;
      console.log("User ID:", user_id);

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
      console.log("Book data:", {
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
      });

      // Check user role
      console.log("User role_id:", req.user.role_id);
      if (req.user.role_id !== 2 && req.user.role_id !== 1) {
        console.log("Access denied: Invalid role");
        return res.status(403).json({
          message: "Access denied: Only Librarians or Admins can create books",
        });
      }

      // Check if your books table has a user_id column
      // If it doesn't, remove user_id from the SQL query
      const bookResult = await pool.query(
        `INSERT INTO books (title, author, genre, year, pages, publisher, description, image, price) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
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
        ]
      );

      console.log("Book created:", bookResult.rows[0]);
      return res.status(201).json({
        message: "Book created successfully",
        book: bookResult.rows[0],
      });
    } catch (error) {
      console.error("Error creating book:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Add these other book functions you'll need
export const getBooks = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const result = await pool.query("SELECT * FROM books ORDER BY title ASC");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const getBookById = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;
      const result = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const updateBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;
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

      // Check if user is authorized (admin or librarian)
      if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2)) {
        return res
          .status(403)
          .json({ message: "Not authorized to update books" });
      }

      const bookExists = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );
      if (bookExists.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      const result = await pool.query(
        "UPDATE books SET title=$1, author=$2, genre=$3, year=$4, pages=$5, publisher=$6, description=$7, image=$8, price=$9 WHERE book_id=$10 RETURNING *",
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
          book_id,
        ]
      );

      res.status(200).json({
        message: "Book updated successfully",
        book: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
export const updateBookPartially = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not Authorized" });
      }

      const { book_id } = req.params;
      const updates = req.body;

      if (req.user.role_id !== 1 && req.user.role_id !== 2) {
        return res.status(403).json({
          message: "Access denied: Only Librarians or Admins can update books",
        });
      }

      let query = "UPDATE books SET ";
      const values: any[] = [];
      let index = 1;

      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          query += `${key} = $${index}, `;
          values.push(updates[key]);
          index++;
        }
      }

      query = query.slice(0, -2); // Remove the trailing comma and space
      query += ` WHERE book_id = $${index} RETURNING *`;
      values.push(book_id);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(200).json({
        message: "Book partially updated successfully",
        book: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating book:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const deleteBook = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;

      // Check if user is authorized (admin or librarian)
      if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2)) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete books" });
      }

      const bookExists = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );
      if (bookExists.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      await pool.query("DELETE FROM books WHERE book_id = $1", [book_id]);

      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
