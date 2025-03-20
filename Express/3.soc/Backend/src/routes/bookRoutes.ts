import express from "express";
import {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  updateBookPartially,
} from "@app/controllers/bookController";
import { protect } from "@app/middleware/Auth/protect";

const router = express.Router();

// Add a console.log to confirm this file is executed
console.log("BookRoutes initialized");

// Book routes
router.post("/", protect, createBook);
router.get("/", getBooks);
router.get("/:book_id", getBookById);
router.put("/:book_id", protect, updateBook);
router.patch("/:book_id", protect, updateBookPartially);
router.delete("/:book_id", protect, deleteBook);

export default router;
