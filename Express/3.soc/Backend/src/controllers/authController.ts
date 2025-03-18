import { Request, Response, NextFunction } from "express";
import pool from "../db/db.config";
import bcrypt from "bcryptjs";
import { generateToken } from "@app/utils/generateToken";
import asyncHandler from "@app/middlewares/asyncHandler";
import { User, UserRequest } from "@app/utils/interface";
import { access } from "fs";

// Check Auth Endpoint
export const checkAuth = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user_id = req.body;
  try {
    const user = await pool.query<User>(
      "SELECT user_id, name, email, role_id FROM users WHERE user_id = $1",
      [user_id]
    );
    if (user.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(201).json({ message: "Successful authentication", user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role_id } = req.body;

    // Check if user exists
    const userExists = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    //before inserting into users, we need to hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //insert into user table
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role_id",
      [name, email, hashedPassword, role_id]
    );

    //generate JWT token for user access
    const accessToken = generateToken(
      res,
      newUser.rows[0].id,
      newUser.rows[0].role_id
    );

    res.status(201).json({
      token: accessToken,
      message: "User registered successfully",
      user: newUser.rows[0],
    });

    //next() - I will redirect automatically is successfully registered
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if user exists
    // Check if user exists
    const userQuery = await pool.query(
      `SELECT *
         FROM users
         JOIN user_role ON users.role_id = user_role.role_id
         WHERE email = $1`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    //query the user
    const user = userQuery.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    //generate JWT token
    const accessToken = generateToken(res, user.user_id, user.role_id);

    res.status(200).json({
      message: "Login successful",
      accessToken: accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        role_id: user.role_id,
      },
    });

    //next();
  }
);

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Logging out user...");
    res.cookie("access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Relax in development
      expires: new Date(0),
    });

    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only secure in production
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Relax in development
      expires: new Date(0),
    });
    console.log("Cookies cleared");
    res.status(200).json({ message: "User logged out successfully" });
  }
);
