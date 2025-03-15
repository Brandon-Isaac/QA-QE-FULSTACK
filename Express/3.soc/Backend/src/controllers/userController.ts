import asyncHandler from "../middlewares/asyncHandler";
import { query, Request, Response } from "express";
import pool from "../db/db.config";
import { User } from "../utils/interface";

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query<User>(
      "SELECT * FROM public.users WHERE user_id = $1",
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error getting the user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await pool.query<User>(
      "SELECT * FROM public.users ORDER BY user_id ASC"
    );
    if (result.rows.length > 0) {
      res.json(result.rows);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error geting users", err);
    res.status(500).json({ messae: "Internal Server error" });
  }
});
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO public.users (name, email, password, role_id) 
       VALUES ($1, $2, $3, $4)`,
      [name.toUpperCase(), email, password, role_id]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.log("User couldn't be created", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.params;
  const { name, email, password, role_id } = req.body;
  try {
    await pool.query(
      `UPDATE public.users SET name = $1, email = $2, password = $3, role_id = $4 WHERE user_id = $5`,
      [name, email, password, role_id, user_id]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.log("Error updating user", err);
    res.status(500).json({ message: "Internal server error" });
  }
});
export const partiallyUpdateUser = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      const updates = req.body;
      let query = "UPDATE public.users SET ";
      const values: any[] = [];
      let index = 1;

      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          query += `${key} = $${index}, `;
          values.push(updates[key]);
          index++;
        }
      }

      query = query.slice(0, -2);
      query += ` WHERE user_id = $${index}`;
      values.push(user_id);

      await pool.query(query, values);
      res.json({ message: "Book partially updated successfully" });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    await pool.query("DELETE FROM public.users WHERE user_id = $1", [user_id]);
    res.status(201).json({ message: "User Deleted successfully" });
  } catch (err) {
    console.error("Deleting User Failed", err);
    res.status(500).json({ message: "Internal Server error" });
  }
});
