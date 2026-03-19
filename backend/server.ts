import cors from "cors";
import express from "express";
import { logger } from "./middleware/logger.js";
import errorHandler from "./middleware/errorHandler.js";

import noteRoutes from "./routes/notes.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { corsOptions } from "./config/corsOptions.js";

const PORT = 3000;
const app = express();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use("/notes", noteRoutes);
app.use("/auth", authRoutes);
app.use("/health", (_, res) => res.sendStatus(200));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
