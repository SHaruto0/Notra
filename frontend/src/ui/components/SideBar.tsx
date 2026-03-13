import type React from "react";
import "./SideBar.css";
import Logo from "../assets/logo.svg";
import Trash from "../assets/trash.svg";
import NewNote from "../assets/new-note.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function SideBar({
  notes,
  setNotes,
}: {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const createNote = async () => {
    setLoading(true);
    try {
      const newNote: Note = await window.db.createNote();
      setNotes((prev) => [newNote, ...prev]);
      navigate(`/notes/${newNote.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteID: string) => {
    try {
      const deletedNote: Note = await window.db.deleteNote(noteID);

      setNotes((prevNotes) => {
        return prevNotes.filter((note) => note.id !== noteID);
      });
      navigate("/");
    } catch (err) {
      console.error(`Error deleting note (${noteID})`, err);
    }
  };

  return (
    <div className="sideBar">
      <div className="logoContainer">
        <img src={Logo} alt="Logo" className="logo" />
        <h2 className="title">Notra</h2>
      </div>
      <div className="buttonContainer">
        <img src={NewNote} alt="New Note" className="newNote" />
        <button className="newNote" onClick={createNote} disabled={loading}>
          {loading ? "Creating..." : "New Note"}
        </button>
      </div>
      <div className="noteHistory">
        <div className="noteHistoryLabel">Your Notes:</div>
        <ul className="noteHistoryList">
          {notes.map((note) => (
            <li className="noteHistoryEntry" key={note.id}>
              <div
                onClick={() => {
                  navigate(`/notes/${note.id}`);
                }}
              >
                {note.title || "Untitled"}
              </div>
              <img
                className="delete"
                src={Trash}
                alt="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(note.id);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="login-button" onClick={() => navigate("/login")}>
        Login
      </div>
    </div>
  );
}

export default SideBar;
