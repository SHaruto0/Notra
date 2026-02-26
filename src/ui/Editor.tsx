import { useParams } from "react-router-dom";
import "./Editor.css";

function Editor() {
  const { noteId } = useParams();

  const fakeNotes: Note[] = [
    { id: "1", title: "A", content: "Hello A", updatedAt: 1 },
    { id: "2", title: "B", content: "Hello B", updatedAt: 1 },
    { id: "3", title: "C", content: "Hello C", updatedAt: 1 },
  ];

  const note = fakeNotes.find((note) => note.id === noteId);

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="content">
      <input className="title " type="text" name="title" value={note.title} />
      <textarea className="body" name="body" value={note.content} />
    </div>
  );
  {
    /* Title: {note.title} <br />
  Content: {note.content} */
  }
}

export default Editor;
