import express from "express";
import {
  loginAccount,
  registerAccount,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerAccount).post("/login", loginAccount);

export default router;
