declare module "express-async-handler" {
  import { RequestHandler } from "express";
  const asyncHandler: (fn: RequestHandler) => RequestHandler;
  export default asyncHandler;
}

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface User {
  id: string;
  username: string;
  password: string;
}
