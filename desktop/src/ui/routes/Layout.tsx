import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import SideBar from "../components/SideBar";

function Layout() {
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
        <Outlet context={{ notes, setNotes }} />
      </div>
    </div>
  );
}

export default Layout;
