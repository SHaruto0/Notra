import asyncHandler from "express-async-handler";
import { supabase } from "../supabase-client.js";
import type { Request, Response } from "express";

import argon2 from "argon2";

const ARGON2_CONFIG: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
};

async function verifyPassword(
  plaintext: string,
  storedHash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, plaintext);
  } catch (err) {
    if (err instanceof Error) {
      // Invalid hash format, corrupted, etc.
      console.error("Password verification error:", err.message);
    }
    return false;
  }
}

// @desc Login to an accout
// @route POST /auth/login
// @access Private
export const loginAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const { data: existingUser, error: lookupError } = await supabase
      .from("users")
      .select("id, password")
      .eq("username", username)
      .maybeSingle();

    if (lookupError) {
      return res.status(500).json({ message: lookupError.message });
    }

    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    const isValid = await verifyPassword(password, existingUser.password);

    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Incorrect username or password" });
    }

    res.status(200).json({
      message: "Login success",
      data: {
        id: existingUser.id,
        username,
        password: existingUser.password,
      },
    });
  },
);

// @desc Register for an account
// @route POST /auth/register
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
