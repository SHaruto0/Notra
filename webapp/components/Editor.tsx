"use client";

import { useNotes } from "@/hooks/useNotes";
import { useEffect, useState } from "react";

function Editor({ noteId }: { noteId: string }) {
  const { notes, setNotes } = useNotes();

  const note = notes.find((note) => note.id === noteId);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div
      style={{ padding: "2rem" }}
      className="w-full h-full text-center flex flex-col"
    >
      <input
        style={{ marginBottom: "1rem" }}
        className="text-[2rem] bg-white rounded-lg"
        type="text"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        style={{ height: "100%" }}
        className=" bg-white text-[1rem] resize-none"
        name="body"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
        }}
      ></textarea>
    </div>
  );
}

export default Editor;
