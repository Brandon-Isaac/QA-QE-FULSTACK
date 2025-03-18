export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
}

export interface Book {
  book_id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  publisher: string;
  description: string;
  available_copies: number;
  total_copies: string;
  image: string;
  price: number;
}
export interface UserRole {
  id: number;
  role_name: string;
  description: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Custom Express Request Type to include `user` with role information
 */

export interface RoleRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role_id: number;
    role_name: string;
    created_at?: Date;
    updated_at?: Date;
  };
}
import { Request } from "express";

export interface UserRequest extends Request {
  user?: User;
  params: {
    [key: string]: string;
  };
}
