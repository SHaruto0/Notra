import fs from "fs";
import path from "path";
import argon2 from "argon2";
import { safeStorage, app } from "electron";

import { clearSession, session } from "../session.js";
import { db } from "../sqlite.js";
import { isOnline } from "../util.js";

const ARGON2_CONFIG: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 64 * 1024,
  timeCost: 3,
  parallelism: 4,
  hashLength: 32,
};

async function hashPassword(plaintext: string): Promise<string> {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return await argon2.hash(plaintext, ARGON2_CONFIG);
}

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

const tokenPath = (key: string) =>
  path.join(app.getPath("userData"), `${key}.enc`);

export function saveSecret(key: string, value: string) {
  const encrypted = safeStorage.encryptString(value);
  fs.writeFileSync(tokenPath(key), encrypted);
}

export function getSecret(key: string): string | null {
  try {
    const encrypted = fs.readFileSync(tokenPath(key));
    return safeStorage.decryptString(encrypted);
  } catch {
    return null;
  }
}

export function deleteSecret(key: string) {
  try {
    fs.unlinkSync(tokenPath(key));
  } catch {
    /* already gone */
  }
}

export async function login(params: AuthType): Promise<ResponseMessageType> {
  const online = await isOnline();
  if (online) {
    const loginOnline = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: params.username,
        password: params.password,
      }),
    });

    if (!loginOnline.ok) {
      const response: ResponseMessageType = {
        success: false,
        message: "Incorrect Username or Password",
      };
      return response;
    }

    const { data: returnedData } = await loginOnline.json();

    saveSecret("accessToken", returnedData.accessToken);
    saveSecret("refreshToken", returnedData.refreshToken);

    const hashedPassword = await hashPassword(params.password);
    const user_id = db.insertUser({
      id: returnedData.id,
      username: returnedData.username,
      password: hashedPassword,
    });

    session.user_id = returnedData.id;
    session.username = returnedData.username;
    session.isLoggedIn = true;

    const response: ResponseMessageType = {
      success: true,
      message: "Log in successful",
    };
    return response;
  }

  const user: User | undefined = db.getUser(params.username);
  if (!user) {
    const response: ResponseMessageType = {
      success: false,
      message:
        "No offline account found. Connect to the internet to log in for the first time.",
    };
    return response;
  }

  const isValid = await verifyPassword(
    params.password,
    user.password as string,
  );

  if (!isValid) {
    const response: ResponseMessageType = {
      success: false,
      message: "Incorrect Username or Password",
    };
    return response;
  }

  session.user_id = user.id;
  session.username = user.username;
  session.isLoggedIn = true;

  const response: ResponseMessageType = {
    success: true,
    message: "Log in successful",
  };
  return response;
}

export async function logout(): Promise<ResponseMessageType> {
  if (session.isLoggedIn) {
    session.isLoggedIn = false;
    session.user_id = db.getOrCreateUser();
    session.username = null;

    const refreshToken = getSecret("refreshToken");

    if (refreshToken) {
      try {
        await fetch("http://localhost:3000/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // server unreachable — still log out locally
      }
    }

    deleteSecret("accessToken");
    deleteSecret("refreshToken");

    const response: ResponseMessageType = {
      success: true,
      message: "Logout successful",
    };
    return response;
  } else {
    const response: ResponseMessageType = {
      success: false,
      message: "Was not logged in",
    };
    return response;
  }
}

export async function register(params: AuthType): Promise<ResponseMessageType> {
  const online = await isOnline();
  if (online) {
    console.log(params.username);
    console.log(params.password);

    const hashedPassword = await hashPassword(params.password);

    const userData: User = {
      id: session.user_id as string,
      username: params.username,
      password: hashedPassword,
    };
    const createUserResponse = await fetch(
      "http://localhost:3000/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );

    if (!createUserResponse.ok) {
      const response: ResponseMessageType = {
        success: false,
        message: "User registration failed",
      };
      return response;
    }

    const { data: returnedData } = await createUserResponse.json();

    db.registerUser({ username: params.username, password: hashedPassword });

    saveSecret("accessToken", returnedData.accessToken);
    saveSecret("refreshToken", returnedData.refreshToken);

    // TODO: try to make an account
    // return jwt stuff. ws

    session.username = returnedData.username;
    session.isLoggedIn = true;

    const response: ResponseMessageType = {
      success: session.isLoggedIn,
      message: "User created succesfully",
    };
    return response;
  } else {
    const response: ResponseMessageType = {
      success: false,
      message: "Need to be online",
    };
    return response;
  }
}
