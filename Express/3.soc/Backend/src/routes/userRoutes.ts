import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  partiallyUpdateUser,
  updateUser,
} from "../controllers/userController";
import express from "express";

const router = express.Router();
router.get("/:id", getUserById);
router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id", partiallyUpdateUser);
router.delete("/:id", deleteUser);
export default router;
