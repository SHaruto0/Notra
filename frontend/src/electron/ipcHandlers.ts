import { getAllNotes, updateNote } from "./notesSyncService.js";
import { SQLiteDatabase } from "./sqlite.js";
import { ipcMainHandle } from "./util.js";

export function setUpSQLiteHandler(db: SQLiteDatabase) {
  ipcMainHandle("getAllNotes", async () => await getAllNotes());
  ipcMainHandle("createNote", () => db.createNote());
  ipcMainHandle("updateNote", async (params) => await updateNote(params));
  ipcMainHandle("deleteNote", (id) => db.deleteNote(id));
}
