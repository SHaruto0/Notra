import express from "express";
import {
  loginAccount,
  logoutAccount,
  refreshAccessToken,
  registerAccount,
} from "../controllers/auth.controller.js";

const router = express.Router();

router
  .post("/register", registerAccount)
  .post("/login", loginAccount)
  .post("/logout", logoutAccount)
  .post("/refresh", refreshAccessToken);

export default router;
