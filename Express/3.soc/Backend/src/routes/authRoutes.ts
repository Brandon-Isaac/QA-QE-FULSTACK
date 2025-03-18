import express from "express";
import {
  checkAuth,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/Auth/authenticateToken";

const router = express.Router();

//public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateToken, checkAuth);

export default router;
