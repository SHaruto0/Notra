import { net } from "electron";
import argon2 from "argon2";

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

// TODO: Implement Login
export function login(params: AuthType): void {}

export function register(params: AuthType): boolean {
  if (net.isOnline()) {
    // bcrypt stuff.
    // connect to supabase
    // set up all notes to sync
    // if success, add to local sqlite
    console.log(params.username);
    console.log(params.password);

    // TODO: try to make an account
    // make sure it's the best
    //

    return true;
  } else {
    throw new Error("Need to be online");
  }
}
