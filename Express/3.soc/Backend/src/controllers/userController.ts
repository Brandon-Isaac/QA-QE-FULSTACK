import { Request, Response } from "express";
import pool from "../db/db.config";
import asyncHandler from "../middleware/asyncHandler";
import { UserRequest } from "@app/utils/types/userTypes";
import bcrypt from "bcryptjs";

// //delete user
// export const deleteUser = asyncHandler(  async (req: Request, res: Response) => {
//     try {
//         const { user_id } = req.params

//         const checkUser = await pool.query("SELECT * FROM public.users WHERE user_id = $1", [user_id])
//         if (checkUser.rows.length === 0) {
//             res.status(400).json({ message: "User not found" });
//             return
//         }
//         await pool.query("DELETE FROM public.users WHERE user_id = $1", [user_id]);
//         res.json({ message: "User deleted successful" });

//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// })

//Get All users
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM public.users ORDER BY user_id ASC "
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Get single user
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const result = await pool.query(
      "SELECT * FROM public.users WHERE user_id = $1",
      [user_id]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ message: "User not found" });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const updateUser = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { user_id } = req.params;
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      // Check if user is authorized (admin )
      if (!req.user || req.user.role_id !== 1) {
        return res
          .status(403)
          .json({ message: "Not authorized to update users" });
      }

      const userExists = await pool.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user_id]
      );
      if (userExists.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const result = await pool.query(
        "UPDATE users SET  email=$1,password=$2 WHERE user_id=$3 RETURNING *",
        [email, hashedPassword, user_id]
      );

      res.status(200).json({
        message: "User updated successfully",
        book: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating User:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export const deleteUser = asyncHandler(
  async (req: UserRequest, res: Response) => {
    try {
      const { user_id } = req.params;

      // Check if user is authorized (admin )
      if (!req.user || req.user.role_id !== 1) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete Users" });
      }

      const userExists = await pool.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user_id]
      );
      if (userExists.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);

      res.status(200).json({ message: "User deleted successfully😊😊" });
    } catch (error) {
      console.error("Error deleting user😢😢:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
