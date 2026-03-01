declare module "express-async-handler" {
  import { RequestHandler } from "express";
  const asyncHandler: (fn: RequestHandler) => RequestHandler;
  export default asyncHandler;
}

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}
