import { dirname } from "path";
import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import { fileURLToPath } from "url";

import fs from "fs";
import path from "path";
import fsPromises from "fs/promises";

import type { Request, Response, NextFunction } from "express";

// Recreate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logEvents = async (
  message: string,
  logFileName: string,
): Promise<void> => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logsDir = path.join(__dirname, "..", "logs");

    if (!fs.existsSync(logsDir)) {
      await fsPromises.mkdir(logsDir);
    }

    await fsPromises.appendFile(path.join(logsDir, logFileName), logItem);
  } catch (err) {
    console.log(err);
  }
};

const logger = (req: Request, res: Response, next: NextFunction): void => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.txt");

  console.log(`${req.method} ${req.url}`);
  next();
};

export { logEvents, logger };
