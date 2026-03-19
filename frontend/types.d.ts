declare module "*.css";
declare module "*.svg";
declare module "better-sqlite3";

interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface AuthType {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string | null;
  password: string | null;
}

interface ResponseMessageType {
  success: boolean;
  message: string;
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

  login: {
    args: [AuthType];
    return: ResponseMessageType;
  };

  register: {
    args: [AuthType];
    return: ResponseMessageType;
  };

  logout: {
    args: [];
    return: ResponseMessageType;
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
  auth: {
    login: (params: AuthType) => Promise<ResponseMessageType>;
    register: (params: AuthType) => Promise<ResponseMessageType>;
    logout: () => Promise<ResponseMessageType>;
  };
}
