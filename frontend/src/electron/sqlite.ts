import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { app } from "electron";
import path from "path";

import { session } from "./session.js";

export class SQLiteDatabase {
  private db;

  constructor() {
    const dbPath = path.join(app.getPath("userData"), "data.db");
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.prepareDB();
  }

  prepareDB() {
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT)`,
      )
      .run();
    this.db
      .prepare(
        `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        content TEXT,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
      )
      .run();

    if (!session.user_id) {
      const user_id: string = this.getOrCreateUser();
      session.user_id = user_id;
    }
  }

  getAllNotes(): Note[] {
    const getNotes = this.db.prepare(
      "SELECT * FROM notes WHERE user_id=? ORDER BY updated_at DESC",
    );
    const notes = getNotes.all(session.user_id) as Note[];

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
      user_id: session.user_id as string,
      title: "",
      content: "",
      updated_at: new Date().toISOString(),
    };
    const insert = this.db.prepare(
      "INSERT INTO notes (id, user_id, updated_at) VALUES (?, ?, ?)",
    );

    insert.run(note.id, session.user_id, note.updated_at);

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
      user_id: session.user_id as string,
      title,
      content,
      updated_at: new Date().toISOString(),
    };
    const update = this.db.prepare(
      "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
    );

    update.run(note.title, note.content, note.updated_at, note.id);

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

  setNote({ id, title, content, updated_at }: Note): void {
    const note: Note | undefined = this.getNote(id);

    if (note) {
      if (
        !(
          note.title === title &&
          note.content === content &&
          note.updated_at === updated_at
        )
      ) {
        const set = this.db.prepare(
          "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
        );
        set.run(title, content, updated_at, id);
      }
    } else {
      const insert = this.db.prepare(
        "INSERT INTO notes (id, user_id, title, content, updated_at) VALUES (?, ?, ?, ?, ?)",
      );
      insert.run(id, session.user_id, title, content, updated_at);
    }
  }

  getOrCreateUser(): string {
    const getUser = this.db.prepare(
      "SELECT id FROM users WHERE username IS NULL LIMIT 1",
    );
    const user = getUser.get() as User | undefined;

    if (!user) {
      const newUser: User = {
        id: uuidv4(),
        username: null,
        password: null,
      };

      const insertUser = this.db.prepare(
        "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
      );

      insertUser.run(newUser.id, newUser.username, newUser.password);

      return newUser.id;
    }

    return user.id;
  }

  registerUser({ username, password }: AuthType) {
    const setUser = this.db.prepare(
      "UPDATE users SET username = ?, password = ? WHERE id = ?",
    );

    setUser.run(username, password, session.user_id);

    return { id: session.user_id, username, password };
  }

  getUser(username: string): User | undefined {
    const getUser = this.db.prepare(
      "SELECT id, password FROM users WHERE username = ?",
    );

    const user: User | undefined = getUser.get(username);

    return user;
  }

  insertUser(params: User) {
    const insertUser = this.db.prepare(
      "INSERT INTO users (id, username, password) VALUES (?, ?, ?)",
    );

    insertUser.run(params.id, params.username, params.password);

    return params.id;
  }

  close(): void {
    this.db.close();
    console.log("SQLite Database Closed.");
  }
}

export const db = new SQLiteDatabase();
