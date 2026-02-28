import { SQLiteDatabase } from "./sqlite.js";
import { ipcMainHandle } from "./util.js";

export function setUpSQLiteHandler(db: SQLiteDatabase) {
  ipcMainHandle("getAllNotes", () => db.getAllNotes());
  ipcMainHandle("createNote", () => db.createNote());
  ipcMainHandle("updateNote", (params) => db.updateNote(params));
  ipcMainHandle("deleteNote", (id) => db.deleteNote(id));
}
