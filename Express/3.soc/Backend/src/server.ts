// main.ts
import { setupAliases } from "import-aliases";
setupAliases();
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import userRoutes from "./routes/userRoutes";
import bookRoutes from "./routes/bookRoutes";
import authRoutes from "@app/routes/authRoutes";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5501"],
    credentials: true, // This is important for cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const _dirname = path.resolve();
const port = process.env.PORT;

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use("/api/books", bookRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}😊😊`);
});
