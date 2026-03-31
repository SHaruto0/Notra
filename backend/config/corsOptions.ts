import type { CorsOptions } from "cors";
import { allowedOrigins } from "./allowedOrigins.js";

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (!origin) {
      // allow requests like Postman or same-origin
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
