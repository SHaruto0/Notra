import express from "express";
import {
  loginAccount,
  logoutAccount,
  registerAccount,
} from "../controllers/auth.controller.js";

const router = express.Router();

router
  .post("/register", registerAccount)
  .post("/login", loginAccount)
  .post("/logout", logoutAccount);

export default router;
