import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController";
import { authenticateToken } from "../middlewares/Auth/authenticateToken";
import { checkAuth } from "../controllers/authController";

const router = express.Router();

//public routes
router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authenticateToken, checkAuth);

export default router;
