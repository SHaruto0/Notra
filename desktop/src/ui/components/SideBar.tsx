import Popup from "./Popup";

import "./SideBar.css";

import Logo from "../assets/logo.svg";
import Trash from "../assets/trash.svg";
import NewNote from "../assets/new-note.svg";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import type React from "react";

function SideBar({
  notes,
  setNotes,
}: {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [requestedToDelete, setRequestedToDelete] = useState<string | null>(
    null,
  );
  const { isAuthenticated, setIsAuthenticated } = useAuth();
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

  const handleLogout = async () => {
    const response: ResponseMessageType = await window.auth.logout();

    const fetchNotes = async () => {
      const data: Note[] = await window.db.getAllNotes();
      setNotes(data);
    };

    fetchNotes();
    setIsAuthenticated(false);
    navigate("/");
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
                  console.log("hi");
                  setRequestedToDelete(note.id);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
      {isAuthenticated ? (
        <div className="logout-button" onClick={handleLogout}>
          Logout
        </div>
      ) : (
        <div className="login-button" onClick={() => navigate("/login")}>
          Login
        </div>
      )}
      {requestedToDelete && (
        <Popup
          text="Are you sure you want to delete this note?"
          negative="Cancel"
          positive="Yes"
          setNegative={() => setRequestedToDelete(null)}
          setPositive={() => {
            deleteNote(requestedToDelete);
            setRequestedToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default SideBar;
