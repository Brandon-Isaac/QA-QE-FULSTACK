import { setupAliases } from "import-aliases";
setupAliases();
import express from "express";
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  partialUpdateBook,
  deleteBook,
} from "@app/controllers/bookController";
import { protect } from "@app/middlewares/Auth/protect";

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", protect, createBook);
router.put("/:id", protect, updateBook);
router.patch("/:id", protect, partialUpdateBook);
router.delete("/:id", protect, deleteBook);

export default router;
