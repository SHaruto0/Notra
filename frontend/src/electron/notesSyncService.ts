import { db, SQLiteDatabase } from "./sqlite.js";

export const getAllNotes = async (): Promise<Note[]> => {
  const response = await fetch("http://localhost:3000/notes", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Get request failed: ${response.status} - ${data.message}`);
  }

  const notes: Note[] = data.notes;

  for (const note of notes) {
    db.setNote(note);
  }

  return db.getAllNotes();
};

export const createNote = async (): Promise<Note> => {
  const note: Note = db.createNote();

  const payload = {
    id: note.id,
    updatedAt: note.updatedAt,
  };

  const response = await fetch("http://localhost:3000/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Create request failed: ${response.status} - ${errorData.message}`,
    );
  }

  return note;
};

export const updateNote = async (params: {
  id: string;
  title: string;
  content: string;
}): Promise<Note> => {
  const note = db.updateNote(params);
  console.log("HI");
  console.log(JSON.stringify(note));

  const response = await fetch("http://localhost:3000/notes", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(note),
  });
  console.log("hello");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Update request failed: ${response.status} - ${errorData.message}`,
    );
  }

  return note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const note = db.deleteNote(id);

  const response = await fetch("http://localhost:3000/notes", {
    method: "DELETE",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      id,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Delete request failed: ${response.status} - ${errorData.message}`,
    );
  }

  return note;
};
