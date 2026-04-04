import asyncHandler from "express-async-handler";
import { supabase } from "../supabase-client.js";
import type { Request, Response } from "express";

import dotenv from "dotenv";
import argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

dotenv.config();

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
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
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

    // Create JWTs
    const accessToken = jwt.sign(
      {
        id: existingUser.id,
        username: username,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      {
        id: existingUser.id,
        username: username,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "2d" },
    );

    const currentTime = Date.now();
    const { error: tokenError } = await supabase.from("refresh_tokens").insert({
      id: uuidv4(),
      user_id: existingUser.id,
      token: refreshToken,
      created_at: new Date(currentTime).toISOString(),
      expires_at: new Date(currentTime + TWO_DAYS_MS).toISOString(),
    });

    if (tokenError) {
      return res.status(500).json({ message: "Failed to create session" });
    }

    console.log(accessToken);

    return res.status(200).json({
      message: "Login success",
      data: {
        id: existingUser.id,
        username,
        accessToken,
        refreshToken,
      },
    });
  },
);

export const logoutAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(500).json({ message: "Refresh token required" });
    }

    const { error: deleteError } = await supabase
      .from("refresh_tokens")
      .delete()
      .eq("token", refreshToken);

    if (deleteError) {
      return res.status(400).json({ message: "Error deleting refresh token" });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  },
);

// @desc Register for an account
// @route POST /auth/register
// @access Private
export const registerAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
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
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert(user)
      .select("id, username")
      .single();

    if (insertError) {
      return res.status(500).json({ message: insertError.message });
    }

    // Create JWTs
    const accessToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "2d" },
    );

    const currentTime = Date.now();
    const { error: tokenError } = await supabase.from("refresh_tokens").insert({
      id: uuidv4(),
      user_id: newUser.id,
      token: refreshToken,
      created_at: new Date(currentTime).toISOString(),
      expires_at: new Date(currentTime + TWO_DAYS_MS).toISOString(),
    });

    if (tokenError) {
      return res.status(500).json({ message: "Failed to create session" });
    }

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: newUser.id,
        username: newUser.username,
        accessToken,
        refreshToken,
      },
    });
  },
);
