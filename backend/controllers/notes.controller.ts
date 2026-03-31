import asyncHandler from "express-async-handler";
import { supabase } from "../supabase-client.js";
import type { Request, Response } from "express";

// TODO: jwt check

// @desc Get all notes
// @route GET /notes
// @access Private
export const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const { id: user_id } = req.user;

  const { data: notes, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(200).json({ message: "Note acquired successfully", notes });
});

// @desc Create a new note
// @route POST /notes
// @access Private
export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const { id, user_id, title, content, updated_at } = req.body;

  if (
    !id ||
    !user_id ||
    title === undefined ||
    content === undefined ||
    !updated_at
  ) {
    return res.status(400).json({
      message:
        "id, user_id, title, content, and updated_at fields are required",
    });
  }

  const newNote: Note = {
    id,
    user_id,
    title,
    content,
    updated_at,
  };
  const { data: note, error } = await supabase
    .from("notes")
    .insert(newNote)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.status(201).json({ message: "Note created successfully", note });
});

// @desc Update a note
// @route PATCH /notes
// @access Private
export const updateNote = asyncHandler(async (req: Request, res: Response) => {
  const { id, title, content, updated_at } = req.body;

  if (!id || title === undefined || content === undefined || !updated_at) {
    return res.status(400).json({
      message: "id, title, content, and updated_at fields are required",
    });
  }

  const { data: note, error } = await supabase
    .from("notes")
    .update({ title, content, updated_at })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.status(200).json({ message: "Note updated successfully", note });
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
export const deleteNote = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "id field is required" });
  }

  const { data: note, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.status(200).json({ message: "Note deleted successfully", note });
});
