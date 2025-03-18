import { setupAliases } from "import-aliases";
setupAliases();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bookRoutes from "./routes/bookRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import userRoutes from "@app/routes/userRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/books", bookRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

// Middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
