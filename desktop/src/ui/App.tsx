import { Route, Routes } from "react-router-dom";

import "./App.css";

import Layout from "./routes/Layout";
import Login from "./components/Login";
import Editor from "./components/Editor";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<div>Select a note</div>} />
        <Route path="/notes/:noteId" element={<Editor />} />
      </Route>

      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
