import { net } from "electron";

export function login(params: AuthType): void {}

export function register(params: AuthType): boolean {
  if (net.isOnline()) {
    // bcrypt stuff.
    // connect to supabase
    // set up all notes to sync
    // if success, add to local sqlite
    console.log(params.username);
    console.log(params.password);
    return true;
  } else {
    throw new Error("Need to be online");
  }
}
