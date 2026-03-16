import express from "express";
import { registerAccount } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/").post(registerAccount);

export default router;
