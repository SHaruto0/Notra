import asyncHandler from "express-async-handler";
import { supabase } from "../supabase-client.js";
import { response, type Request, type Response } from "express";

import dotenv from "dotenv";
import argon2 from "argon2";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

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

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

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
    const rawRefreshToken = jwt.sign(
      {
        id: existingUser.id,
        username: username,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "2d" },
    );

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const currentTime = Date.now();
    const { error: tokenError } = await supabase.from("refresh_tokens").insert({
      id: uuidv4(),
      user_id: existingUser.id,
      token: hashedRefreshToken,
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
        refreshToken: rawRefreshToken,
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

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const { error: deleteError } = await supabase
      .from("refresh_tokens")
      .delete()
      .eq("token", hashedRefreshToken);

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
    const { id, username, password: hashedPassword } = req.body;

    if (!id || !username || !hashedPassword) {
      return res
        .status(400)
        .json({ message: "Id, username and password required" });
    }

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
      password: hashedPassword,
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

    const rawRefreshToken = jwt.sign(
      { id: newUser.id, username: newUser.username },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "2d" },
    );

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(rawRefreshToken)
      .digest("hex");

    const currentTime = Date.now();
    const { error: tokenError } = await supabase.from("refresh_tokens").insert({
      id: uuidv4(),
      user_id: newUser.id,
      token: hashedRefreshToken,
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
        refreshToken: rawRefreshToken,
      },
    });
  },
);

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as jwt.JwtPayload;
    } catch {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });
    }

    const hashedRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const { data: storedToken, error } = await supabase
      .from("refresh_tokens")
      .select("*")
      .eq("token", hashedRefreshToken)
      .eq("user_id", decoded.id)
      .maybeSingle();

    if (error || !storedToken) {
      return res.status(403).json({ message: "Refresh token not recognised" });
    }

    // rotate — delete old, issue new
    await supabase
      .from("refresh_tokens")
      .delete()
      .eq("token", hashedRefreshToken);

    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "15m" },
    );

    const newRawRefreshToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "2d" },
    );

    const newHashedRefreshToken = crypto
      .createHash("sha256")
      .update(newRawRefreshToken)
      .digest("hex");

    const currentTime = Date.now();
    const { error: insertError } = await supabase
      .from("refresh_tokens")
      .insert({
        id: uuidv4(),
        user_id: decoded.id,
        token: newHashedRefreshToken,
        created_at: new Date(currentTime).toISOString(),
        expires_at: new Date(currentTime + TWO_DAYS_MS).toISOString(),
      });

    if (insertError) {
      return res
        .status(500)
        .json({ message: "Failed to rotate refresh token" });
    }

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    });
  },
);
