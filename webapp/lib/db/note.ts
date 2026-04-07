import supabase from "../supabase";

export const getAllNotes = async () => {
  const { data, error } = await supabase.from("notes").select("*");

  if (error) throw error;

  return data;
};
