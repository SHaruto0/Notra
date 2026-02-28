import SideBar from "./SideBar";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Editor from "./Editor";
import { useEffect, useState } from "react";

function App() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const data: Note[] = await window.db.getAllNotes();
      setNotes(data);
    };

    fetchNotes();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <SideBar notes={notes} setNotes={setNotes} />
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<div>Select a note</div>} />
          <Route
            path="/notes/:noteId"
            element={<Editor notes={notes} setNotes={setNotes} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
