import { logEvents } from "./logger.js";

import type { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin ?? "unknown"}`,
    "errLog.log",
  );

  console.error(err.stack);

  const status =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
};

export default errorHandler;
