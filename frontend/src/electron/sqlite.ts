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
        userId TEXT NOT NULL,
        title TEXT,
        content TEXT,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE)`,
      )
      .run();

    if (!session.userId) {
      const userId: string = this.getOrCreateUser();
      session.userId = userId;
    }
  }

  getAllNotes(): Note[] {
    const getNotes = this.db.prepare(
      "SELECT * FROM notes WHERE userId=? ORDER BY updatedAt DESC",
    );
    const notes = getNotes.all(session.userId) as Note[];

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
      userId: session.userId as string,
      title: "",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    const insert = this.db.prepare(
      "INSERT INTO notes (id, userId, updatedAt) VALUES (?, ?, ?)",
    );

    insert.run(note.id, session.userId, note.updatedAt);

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
      userId: session.userId as string,
      title,
      content,
      updatedAt: new Date().toISOString(),
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
        "INSERT INTO notes (id, userId, title, content, updatedAt) VALUES (?, ?, ?, ?, ?)",
      );
      insert.run(id, session.userId, title, content, updatedAt);
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

    setUser.run(username, password, session.userId);

    return { id: session.userId, username, password };
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
