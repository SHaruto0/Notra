import type React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Editor.css";

function Editor({
  notes,
  setNotes,
}: {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}) {
  const { noteId } = useParams<{ noteId: string }>();
  const note = notes.find((note) => note.id === noteId);

  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  useEffect(() => {
    if (!noteId || !note) return;

    // Only save if title or content actually changed
    if (title === note.title && content === note.content) return;

    const timeout = setTimeout(async () => {
      try {
        const updatedNote: Note = await window.db.updateNote({
          id: noteId,
          title,
          content,
        });

        setNotes((prevNotes) => {
          const filteredNotes = prevNotes.filter((note) => note.id !== noteId);
          return [updatedNote, ...filteredNotes];
        });
      } catch (err) {
        console.error("Failed to update note:", err);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [title, content, noteId, setNotes]);

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="content">
      <input
        className="title "
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="body"
        name="body"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
        }}
      />
    </div>
  );
}

export default Editor;
