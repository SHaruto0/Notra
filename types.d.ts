declare module "*.css";
declare module "*.svg";
declare module "better-sqlite3";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

type EventPayloadMapping = {
  getAllNotes: {
    args: [];
    return: Note[];
  };

  createNote: {
    args: [];
    return: Note;
  };

  updateNote: {
    args: [{ id: string; title: string; content: string }];
    return: Note;
  };

  deleteNote: {
    args: [id: string];
    return: Note;
  };
};

interface Window {
  db: {
    getAllNotes: () => Promise<Note[]>;
    createNote: () => Promise<Note>;
    updateNote: (params: {
      id: string;
      title: string;
      content: string;
    }) => Promise<Note>;
    deleteNote: (id: string) => Promise<Note>;
  };
}
