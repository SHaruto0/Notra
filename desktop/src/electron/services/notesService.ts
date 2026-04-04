import { session } from "../session.js";
import { db, SQLiteDatabase } from "../sqlite.js";
import { isOnline, noteActions } from "../util.js";

export const getAllNotes = async (): Promise<Note[]> => {
  console.log(await isOnline());
  if ((await isOnline()) && session.isLoggedIn) {
    const data = await noteActions("GET");

    if (!data) {
      return db.getAllNotes();
    }

    const remoteNotes: Note[] = data.notes;
    const localNotes: Note[] = db.getAllNotes();
    console.log(remoteNotes);
    console.log(localNotes);

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
        if (local!.updated_at > remote!.updated_at) {
          await noteActions("PATCH", local);
        } else if (remote!.updated_at > local!.updated_at) {
          db.setNote(remote!);
        }
      }
    }

    return db.getAllNotes();
  } else {
    return db.getAllNotes();
  }
};

export const createNote = async (): Promise<Note> => {
  const note: Note = db.createNote();

  if ((await isOnline()) && session.isLoggedIn) {
    const data = await noteActions("POST", note);
  }

  return note;
};

export const updateNote = async (params: {
  id: string;
  title: string;
  content: string;
}): Promise<Note> => {
  const note = db.updateNote(params);

  if ((await isOnline()) && session.isLoggedIn) {
    const data = await noteActions("PATCH", note);
  }

  return note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const note = db.deleteNote(id);

  if ((await isOnline()) && session.isLoggedIn) {
    const data = await noteActions("DELETE", { id });
  }

  return note;
};
