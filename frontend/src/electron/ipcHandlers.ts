import {
  createNote,
  deleteNote,
  getAllNotes,
  updateNote,
} from "./notesSyncService.js";
import { SQLiteDatabase } from "./sqlite.js";
import { ipcMainHandle } from "./util.js";

export function setUpSQLiteHandler(db: SQLiteDatabase) {
  ipcMainHandle("getAllNotes", async () => await getAllNotes());
  ipcMainHandle("createNote", async () => await createNote());
  ipcMainHandle("updateNote", async (params) => await updateNote(params));
  ipcMainHandle("deleteNote", async (id) => await deleteNote(id));
}
