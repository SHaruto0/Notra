import { ipcMain } from "electron";
import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
} from "./services/notesService.js";
import { SQLiteDatabase } from "./sqlite.js";
import { ipcMainHandle } from "./util.js";
import { login, logout, register } from "./services/authService.js";

export function setUpSQLiteHandler(db: SQLiteDatabase) {
  ipcMainHandle("getAllNotes", async () => await getAllNotes());
  ipcMainHandle("createNote", async () => await createNote());
  ipcMainHandle("updateNote", async (params) => await updateNote(params));
  ipcMainHandle("deleteNote", async (id) => await deleteNote(id));
}

export function setUpAuthHandler() {
  ipcMainHandle("login", (params) => login(params));
  ipcMainHandle("register", (params) => register(params));
  ipcMainHandle("logout", () => logout());
}
