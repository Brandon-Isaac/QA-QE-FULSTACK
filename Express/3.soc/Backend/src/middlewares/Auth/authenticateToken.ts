import { UserRequest } from "@app/utils/interface";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

export const authenticateToken = (
  req: UserRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
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
  if (!token) {
    res.status(401).json({ message: "Unauthorized,no token" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }

    req.user = user as {
      id: number;
      role: string;
      username: string;
      email: string;
      role_id: number;
    };
    next();
  });
};
