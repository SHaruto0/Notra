declare module "express-async-handler" {
  import { RequestHandler } from "express";
  const asyncHandler: (fn: RequestHandler) => RequestHandler;
  export default asyncHandler;
}

interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: string;
}

interface User {
  id: string;
  username: string;
  password: string;
}
