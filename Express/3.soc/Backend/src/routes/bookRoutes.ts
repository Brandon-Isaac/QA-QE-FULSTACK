import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  partialUpdateBook,
  deleteBook,
} from "../controllers/bookController";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", createBook);
router.put("/:id", updateBook);
router.patch("/:id", partialUpdateBook);
router.delete("/:id", deleteBook);

export default router;
