"use client";

import { useContext } from "react";
import { NotesContext } from "@/contexts/NotesContext";

export function useNotes() {
  const context = useContext(NotesContext);

  if (!context) {
    throw new Error("useNote must be used within an NoteProvider");
  }

  return context;
}
