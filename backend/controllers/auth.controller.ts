import asyncHandler from "express-async-handler";
import { supabase } from "../supabase-client.js";
import type { Request, Response } from "express";

// @desc Register
// @route POST /auth
// @access Private
export const registerAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, username, password } = req.body;

    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("username")
      .eq("username", username)
      .maybeSingle();

    if (lookupError) {
      return res.status(500).json({ message: lookupError.message });
    }

    if (existingUser) {
      return res.status(409).json({ message: "Username is taken" });
    }

    const user: User = {
      id,
      username,
      password,
    };
    const { error: insertError } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single();

    if (insertError) {
      return res.status(500).json({ message: insertError.message });
    }

    res.status(201).json({ message: "User registered successfully" });
  },
);
