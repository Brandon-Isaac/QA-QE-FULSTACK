export interface User {
  id: string;
  username: string;
  email: string;
  role_id: string;
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
export interface UserRequest extends Request {
  user?: User;
}
