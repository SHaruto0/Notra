"use client";

import { useNotes } from "@/hooks/useNotes";
import Link from "next/link";

function SideBar() {
  const { notes, setNotes } = useNotes();

  return (
    <div
      style={{ paddingLeft: "1rem" }}
      className="bg-white w-52 h-screen pt-6 flex flex-col"
    >
      <div className="flex items-center justify-start">
        <img src="/logo.svg" alt="Logo" className="w-[25px] h-auto" />
        <h2 style={{ paddingLeft: "1rem" }} className="text-[2rem] text-black">
          Notra
        </h2>
      </div>
      <div
        style={{ paddingTop: "1rem" }}
        className="flex items-center justify-start"
      >
        <img src="/new-note.svg" alt="New Note" className="w-[30px] h-auto" />
        <button className="ml-2 bg-transparent border-none p-0 cursor-pointer">
          New Note
        </button>
      </div>
      <div className="flex flex-col w-full flex-1">
        <div className="">Your Notes:</div>
        <ul
          style={{ scrollbarGutter: "stable" }}
          className="w-full overflow-y-auto h-[calc(100vh-200px)]"
        >
          {notes.map((note: Note) => (
            <li
              key={note.id}
              style={{ padding: "10px 0" }}
              className="flex flex-row items-center justify-between list-none w-full"
            >
              <Link
                href={`/notes/${note.id}`}
                className="text-black hover:bg-[rgb(214,214,214)]"
              >
                {note.title || "Untitled"}{" "}
              </Link>
              <img
                className="w-[30px] hover:bg-[rgb(214,214,214)] cursor-pointer"
                src="/trash.svg"
                alt="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
