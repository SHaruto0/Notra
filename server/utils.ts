import { supabase } from "./supabase-client.js";

export async function scheduleTokenCleanup() {
  const cleanup = async () => {
    const { error } = await supabase
      .from("refresh_tokens")
      .delete()
      .lt("expires_at", new Date().toISOString());

    if (error) {
      console.error("Token cleanup failed:", error.message);
    } else {
      console.log("Expired refresh tokens cleaned up");
    }
  };

  await cleanup(); // run immediately on startup
  setInterval(cleanup, 24 * 60 * 60 * 1000); // then every 24 hours
}
