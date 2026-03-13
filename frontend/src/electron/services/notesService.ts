import { db, SQLiteDatabase } from "../sqlite.js";
import { noteActions } from "../util.js";

export const getAllNotes = async (): Promise<Note[]> => {
  const data = await noteActions("GET");

  if (!data) {
    return db.getAllNotes();
  }

  const remoteNotes: Note[] = data.notes;
  const localNotes: Note[] = db.getAllNotes();

  const remoteMap = new Map(remoteNotes.map((n) => [n.id, n]));
  const localMap = new Map(localNotes.map((n) => [n.id, n]));

  const allIds = new Set([...remoteMap.keys(), ...localMap.keys()]);

  for (const id of allIds) {
    const remote = remoteMap.get(id);
    const local = localMap.get(id);

    if (local && !remote) {
      await noteActions("POST", local);
    } else if (!local && remote) {
      db.setNote(remote);
    } else {
      if (local!.updatedAt > remote!.updatedAt) {
        await noteActions("PATCH", local);
      } else if (remote!.updatedAt > local!.updatedAt) {
        db.setNote(remote!);
      }
    }
  }

  return db.getAllNotes();
};

export const createNote = async (): Promise<Note> => {
  const note: Note = db.createNote();

  const data = await noteActions("POST", note);

  return note;
};

export const updateNote = async (params: {
  id: string;
  title: string;
  content: string;
}): Promise<Note> => {
  const note = db.updateNote(params);

  const data = await noteActions("PATCH", note);

  return note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const note = db.deleteNote(id);

  const data = await noteActions("DELETE", { id });

  return note;
};
