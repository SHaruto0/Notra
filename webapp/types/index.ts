declare module "*.css";
declare module "*.svg";
declare module "better-sqlite3";

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface AuthType {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string | null;
  password: string | null;
}

interface ResponseMessageType {
  success: boolean;
  message: string;
}
