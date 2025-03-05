import express from "express";
import { getBooks } from "./books";

export const bookRouter = express.Router();

bookRouter.get("/", (req, res) => {
  const books = getBooks(req.query);
  res.json(books);
});
