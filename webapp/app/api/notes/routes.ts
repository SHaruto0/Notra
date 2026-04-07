import { getAllNotes } from "@/lib/db/note";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getAllNotes();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 },
    );
  }
}
