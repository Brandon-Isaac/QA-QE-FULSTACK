import express from "express";
import cors from "cors";
import { bookRouter } from "./routes";
import { errorHandler } from "./middleware";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/books", bookRouter);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
