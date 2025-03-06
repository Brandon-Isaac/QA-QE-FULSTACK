import express from "express";
import { getBooks } from "./books";

export const bookRouter = express.Router();

bookRouter.get("/api/books", (req, res) => {
  const books = getBooks(req.query);
  res.json(books);
});
