"use client";

import { createContext, useState } from "react";
import type { ReactNode } from "react";

type NotesContextType = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
};

export const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({
  children,
  initialNotes = [],
}: {
  children: ReactNode;
  initialNotes?: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  return (
    <NotesContext.Provider value={{ notes, setNotes }}>
      {children}
    </NotesContext.Provider>
  );
}
