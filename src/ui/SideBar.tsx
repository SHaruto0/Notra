import "./SideBar.css";
import Logo from "./assets/logo.svg";
import NewNote from "./assets/new-note.svg";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const navigate = useNavigate();
  const fakeNotes: Note[] = [
    { id: "1", title: "A", content: "Hello A", updatedAt: 1 },
    { id: "2", title: "B", content: "Hello B", updatedAt: 1 },
    { id: "3", title: "C", content: "Hello C", updatedAt: 1 },
  ];

  return (
    <div className="sideBar">
      <div className="logoContainer">
        <img src={Logo} alt="Logo" className="logo" />
        <h2 className="title">Notra</h2>
      </div>
      <div className="buttonContainer">
        <img src={NewNote} alt="New Note" className="newNote" />
        <button className="newNote">New Note</button>
      </div>
      <div className="noteHistory">
        <div className="noteHistoryLabel">Your Notes:</div>
        <ul className="noteHistoryList">
          {fakeNotes.map((note) => (
            <li
              className="noteHistoryEntry"
              key={note.id}
              onClick={() => {
                navigate(`/notes/${note.id}`);
              }}
            >
              {note.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
