import {
  deleteUser,
  getUserById,
  getUsers,
} from "../controllers/userController";
import express from "express";
import { protect } from "@app/middlewares/Auth/protect";

const router = express.Router();
router.get("/:id", protect, getUserById);
router.get("/", protect, getUsers);
//router.post("/", createUser);
//router.put("/:id", updateUser);
//router.patch("/:id", partiallyUpdateUser);
router.delete("/:id", protect, deleteUser);
export default router;
