import SideBar from "./SideBar";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Editor from "./Editor";

function App() {
  return (
    <div style={{ display: "flex" }}>
      <SideBar /> {/* sidebar always visible */}
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<div>Select a note</div>} />
          <Route path="/notes/:noteId" element={<Editor />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
