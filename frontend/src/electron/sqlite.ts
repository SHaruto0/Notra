import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { app } from "electron";
import path from "path";

export class SQLiteDatabase {
  private db;

  constructor() {
    const dbPath = path.join(app.getPath("userData"), "notes.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.prepareDB();
  }

  prepareDB() {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        updatedAt INTEGER NOT NULL
    )
    `,
      )
      .run();
  }

  getAllNotes(): Note[] {
    const getNotes = this.db.prepare(
      "SELECT * FROM notes ORDER BY updatedAt DESC",
    );
    const notes = getNotes.all() as Note[];

    return notes;
  }

  getNote(id: string): Note | undefined {
    const getNote = this.db.prepare("SELECT * FROM notes WHERE id = ?");

    const note: Note | undefined = getNote.get(id);

    return note;
  }

  createNote(): Note {
    const note: Note = {
      id: uuidv4(),
      title: "",
      content: "",
      updatedAt: Date.now(),
    };
    const insert = this.db.prepare(
      "INSERT INTO notes (id, updatedAt) VALUES (?, ?)",
    );

    insert.run(note.id, note.updatedAt);

    return note;
  }

  updateNote({
    id,
    title,
    content,
  }: {
    id: string;
    title: string;
    content: string;
  }): Note {
    const note: Note = {
      id,
      title,
      content,
      updatedAt: Date.now(),
    };
    const update = this.db.prepare(
      "UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?",
    );

    update.run(note.title, note.content, note.updatedAt, note.id);

    return note;
  }

  deleteNote(id: string): Note {
    const note: Note = this.db
      .prepare("SELECT * FROM notes WHERE id = ?")
      .get(id) as Note;

    const del = this.db.prepare("DELETE FROM notes WHERE id = ?");
    del.run(id);

    return note;
  }

  setNote({ id, title, content, updatedAt }: Note): void {
    const note: Note | undefined = this.getNote(id);

    if (note) {
      if (
        !(
          note.title === title &&
          note.content === content &&
          note.updatedAt === updatedAt
        )
      ) {
        const set = this.db.prepare(
          "UPDATE notes SET title = ?, content = ?, updatedAt = ? WHERE id = ?",
        );
        set.run(title, content, updatedAt, id);
      }
    } else {
      const insert = this.db.prepare(
        "INSERT INTO notes (id, title, content, updatedAt) VALUES (?, ?, ?, ?)",
      );
      insert.run(id, title, content, updatedAt);
    }
  }

  close(): void {
    this.db.close();
    console.log("SQLite Database Closed.");
  }
}

export const db = new SQLiteDatabase();
