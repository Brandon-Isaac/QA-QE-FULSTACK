// main.ts
import { setupAliases } from "import-aliases";
setupAliases();
import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import cors from "cors";
// import userRoutes from "./routes/userRoutes";
// import bookRoutes from "./routes/bookRoutes";
// import authRoutes from "@app/routes/authRoutes";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
interface UserRole {
  id: number;
  role_name: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}
interface User {
  user_id: string;
  name: string;
  email: string;
  password?: string; // Exclude password when returning user info
  role_id: number;
  role_name: string;
  created_at?: Date;
  updated_at?: Date;
}

interface Book {
  book_id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  publisher: string;
  description: string;
  image: string;
  price: number;
  total_copies: number;
  available_copies: number;
  borrower_id?: number; // Foreign key from users table
  created_at?: Date;
  updated_at?: Date;
}
interface BookRequest extends UserRequest {
  params: {
    book_id: string; // Ensures `req.params.id` always exists
  };
  book?: Book;
}
import { Request, Response, NextFunction } from "express";

interface UserRequest extends express.Request {
  user?: User;
}
interface UserRequest extends Request {
  user?: User;
}

const app = express();
const port = process.env.PORT;
// const generateToken = (res: Response, id: string, roleId: number) => {
//   const jwtSecret = process.env.JWT_SECRET;
//   const refreshSecret = process.env.REFRESH_TOKEN_SECRET;

//   if (!jwtSecret || !refreshSecret) {
//     throw new Error(
//       "JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables"
//     );
//   }

//   try {
//     // Use consistent property name: id (not id)
//     const accessToken = jwt.sign({ id, roleId }, jwtSecret, {
//       expiresIn: "15m",
//     });
//     const refreshToken = jwt.sign({ id }, refreshSecret, {
//       expiresIn: "30d",
//     });

//     // Rest of your code remains the same
//     res.cookie("access_token", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV !== "development",
//       sameSite: "strict",
//       maxAge: 15 * 60 * 1000, // 15 minutes
//     });

//     res.cookie("refresh_token", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV !== "development",
//       sameSite: "strict",
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     });

//     return { accessToken, refreshToken };
//   } catch (error) {
//     console.error("Error generating JWT:", error);
//     throw new Error("Error generating authentication tokens");
//   }
// };
const asyncHandler = <T = any>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from header:", token);
    }

    // Check for token in cookies
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
      console.log("Token from cookie:", token);
    }

    // If no token found
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error(
          "ACCESS_TOKEN_SECRET is not defined in environment variables"
        );
      }

      // Verify token - make sure to use the correct property names
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as {
        id: string;
        roleId: number;
      };

      // Get user from database using id
      const userQuery = await pool.query(
        "SELECT users.user_id, users.name, users.email, users.role_id, user_role.role_name FROM users JOIN user_role ON users.role_id = user_role.role_id WHERE users.user_id = $1",
        [decoded.id]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach user to request
      req.user = userQuery.rows[0];

      next();
    } catch (error) {
      console.error("JWT Error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
);
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5501"],
    credentials: true, // This is important for cookies
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//Routes
app.post(
  "/api/auth/login",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Check if user exists
      const userQuery = await pool.query(
        "SELECT users.user_id, users.name, users.email, users.password, users.role_id, user_role.role_name FROM users JOIN user_role ON users.role_id = user_role.role_id WHERE users.email = $1",
        [email]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const user = userQuery.rows[0];

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create tokens
      if (
        !process.env.ACCESS_TOKEN_SECRET ||
        !process.env.REFRESH_TOKEN_SECRET
      ) {
        throw new Error("Token secrets not defined in environment variables");
      }

      const accessToken = jwt.sign(
        { id: user.user_id, roleId: user.role_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" } // Increased expiration time for better user experience
      );

      const refreshToken = jwt.sign(
        { id: user.user_id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
      );

      // Set tokens as cookies
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      // Log the tokens for debugging
      console.log("Access Token:", accessToken);
      console.log("Refresh Token:", refreshToken);

      // Send user data and tokens
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user.user_id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          role_name: user.role_name,
        },
        tokens: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.post(
  "/api/auth/register",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { name, email, password, role_id } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        "INSERT INTO users (name, email, password, role_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, email, hashedPassword, role_id]
      );
      res.status(201).json({
        message: "User registered successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Server error" });
    }
  })
);
app.get(
  "/api/user/profile",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      // Since we're using the protect middleware, req.user should contain the logged-in user's basic info
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
      }
      // Get detailed profile info for the logged-in user
      const userQuery = await pool.query(
        `SELECT 
          users.user_id, 
          users.name, 
          users.email, 
          users.role_id, 
          user_role.role_name
        FROM users 
        JOIN user_role ON users.role_id = user_role.role_id 
        WHERE users.user_id = $1`,
        [req.user.user_id] // Change from req.user.id to req.user.user_id
      );

      if (userQuery.rows.length === 0) {
        return res.status(404).json({ message: "User profile not found" });
      }

      // Return the logged-in user's profile
      res.status(200).json({
        message: "Profile fetched successfully",
        user: {
          id: userQuery.rows[0].user_id,
          name: userQuery.rows[0].name,
          email: userQuery.rows[0].email,
          role_id: userQuery.rows[0].role_id,
          role_name: userQuery.rows[0].role_name,
          created_at: userQuery.rows[0].created_at,
        },
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.post(
  "/api/auth/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refresh_token;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token not found" });
      }

      if (
        !process.env.REFRESH_TOKEN_SECRET ||
        !process.env.ACCESS_TOKEN_SECRET
      ) {
        throw new Error("Token secrets not defined in environment variables");
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      ) as { id: string };

      // Get user from database
      const userQuery = await pool.query(
        "SELECT users.user_id, users.role_id FROM users WHERE users.user_id = $1",
        [decoded.id]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = userQuery.rows[0];

      // Create new access token
      const accessToken = jwt.sign(
        { id: user.user_id, roleId: user.role_id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Set new access token as cookie
      res.cookie("access_token", accessToken, {
        httpOnly: true,
        maxAge: 3600000, // 1 hour
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      res.status(200).json({
        message: "Token refreshed",
        access_token: accessToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  })
);
app.post(
  "/api/auth/logout",
  asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.status(200).json({ message: "Logged out successfully" });
  })
);
app.get(
  "/api/users/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT * FROM public.users ORDER BY user_id ASC "
      );
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.get(
  "/api/users/:user_id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);
app.delete(
  "/api/users/:user_id",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
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
  })
);
app.put(
  "/api/users/:user_id",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
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
  })
);

app.post(
  "/api/books/",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
    console.log("createBook function called");
    console.log("Request user:", req.user);

    try {
      // Extract user_id from the authenticated user's token
      if (!req.user) {
        console.log("No user found in request");
        return res.status(401).json({ message: "Not authorized" });
      }

      const user_id = req.user.user_id;
      console.log("User ID:", user_id);

      const {
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
        image,
        price,
      } = req.body;
      console.log("Book data:", {
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
      });

      // Check user role
      console.log("User role_id:", req.user.role_id);
      if (req.user.role_id !== 2 && req.user.role_id !== 1) {
        console.log("Access denied: Invalid role");
        return res.status(403).json({
          message: "Access denied: Only Librarians or Admins can create books",
        });
      }

      // Check if your books table has a user_id column
      // If it doesn't, remove user_id from the SQL query
      const bookResult = await pool.query(
        `INSERT INTO books (title, author, genre, year, pages, publisher, description, image, price) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          title,
          author,
          genre,
          year,
          pages,
          publisher,
          description,
          image,
          price,
        ]
      );

      console.log("Book created:", bookResult.rows[0]);
      return res.status(201).json({
        message: "Book created successfully",
        book: bookResult.rows[0],
      });
    } catch (error) {
      console.error("Error creating book:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.get(
  "/api/books/",
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      const result = await pool.query("SELECT * FROM books ORDER BY title ASC");
      res.status(200).json(result.rows);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.get(
  "/api/books/:book_id",
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;
      const result = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.put(
  "/api/books/:book_id",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;
      const {
        title,
        author,
        genre,
        year,
        pages,
        publisher,
        description,
        image,
        price,
      } = req.body;

      // Check if user is authorized (admin or librarian)
      if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2)) {
        return res
          .status(403)
          .json({ message: "Not authorized to update books" });
      }

      const bookExists = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );
      if (bookExists.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      const result = await pool.query(
        "UPDATE books SET title=$1, author=$2, genre=$3, year=$4, pages=$5, publisher=$6, description=$7, image=$8, price=$9 WHERE book_id=$10 RETURNING *",
        [
          title,
          author,
          genre,
          year,
          pages,
          publisher,
          description,
          image,
          price,
          book_id,
        ]
      );

      res.status(200).json({
        message: "Book updated successfully",
        book: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);
app.patch(
  "/api/books/:book_id",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not Authorized" });
      }

      const { book_id } = req.params;
      const updates = req.body;

      if (req.user.role_id !== 1 && req.user.role_id !== 2) {
        return res.status(403).json({
          message: "Access denied: Only Librarians or Admins can update books",
        });
      }

      let query = "UPDATE books SET ";
      const values: any[] = [];
      let index = 1;

      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          query += `${key} = $${index}, `;
          values.push(updates[key]);
          index++;
        }
      }

      query = query.slice(0, -2); // Remove the trailing comma and space
      query += ` WHERE book_id = $${index} RETURNING *`;
      values.push(book_id);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.status(200).json({
        message: "Book partially updated successfully",
        book: result.rows[0],
      });
    } catch (err) {
      console.error("Error updating book:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  })
);
app.delete(
  "/api/books/:book_id",
  protect,
  asyncHandler(async (req: UserRequest, res: Response) => {
    try {
      const { book_id } = req.params;

      // Check if user is authorized (admin or librarian)
      if (!req.user || (req.user.role_id !== 1 && req.user.role_id !== 2)) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete books" });
      }

      const bookExists = await pool.query(
        "SELECT * FROM books WHERE book_id = $1",
        [book_id]
      );
      if (bookExists.rows.length === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      await pool.query("DELETE FROM books WHERE book_id = $1", [book_id]);

      res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
