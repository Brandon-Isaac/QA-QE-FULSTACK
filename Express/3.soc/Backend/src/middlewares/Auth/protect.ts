import { setupAliases } from "import-aliases";
setupAliases();
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "@app/db/db.config";

interface UserRequest extends Request {
  user?: {
    user_id: string;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
  };
}
import asyncHandler from "../asyncHandler";

//Auth middleware to protect routes
export const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    //trying to get token from Authorization Header
    if (
      (req.headers as any).authorization &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    //get the token from cookies
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    //if no token found
    if (!token) {
      res.status(401).json({ message: "Not authorized , no token" });
    }

    try {
      //we have the token but we nneed to verify it
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      //verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: string;
        roleId: number;
      };
      console.log("Decoded JWT", decoded);

      //get the user from database
      const userQuery = await pool.query(
        "SELECT users.user_id, users.name, users.email, users.role_id, user_role.role_name FROM users JOIN user_role ON users.role_id = user_role.role_id WHERE users.user_id = $1",
        [decoded.userId]
      );

      if (userQuery.rows.length === 0) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      //attach the user to the request
      req.user = userQuery.rows[0];

      next(); //proceed to next thing
    } catch (error) {
      console.error("JWT Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
);
export const authenticateToken = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  if (!process.env.JWT_SECRET) {
    return res
      .status(500)
      .json({ message: "JWT_SECRET is not defined in environment variables" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user as {
      user_id: string;
      name: string;
      email: string;
      role_id: number;
      role_name: string;
    };
    next();
  });
};
