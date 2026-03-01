import { db, SQLiteDatabase } from "./sqlite.js";

export const getAllNotes = async (): Promise<Note[]> => {
  try {
    const response = await fetch("http://localhost:3000/notes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Get request failed: ${response.status}`);
    }

    const data = await response.json();

    const notes: Note[] = data.notes;

    for (const note of notes) {
      db.setNote(note);
    }
  } catch (err) {
    console.error(err);
  }

  return db.getAllNotes();
};

export const updateNote = async (params: {
  id: string;
  title: string;
  content: string;
}): Promise<Note> => {
  let note: Note;
  try {
    note = db.updateNote(params);

    const response = await fetch("http://localhost:3000/notes", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    });

    if (!response.ok) {
      throw new Error(`Update request failed: ${response.status}`);
    }
  } catch (err) {
    console.error(err);
  }

  return db.getNote(params.id)!;
};
