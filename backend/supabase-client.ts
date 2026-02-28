import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!,
);

const getNotes = async () => {
  const { data, error } = await supabase.from("notes").select("*");
  if (error) console.error("Error:", error);
  else console.log("Notes:", data);
};

getNotes();
