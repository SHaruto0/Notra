import { session } from "../session.js";
import { db, SQLiteDatabase } from "../sqlite.js";
import { isOnline } from "../util.js";
import { getSecret, saveSecret, sendForceLogout } from "./authService.js";

async function noteAction(method: string, accessToken: string, payload?: any) {
  let response;
  if (method === "GET") {
    response = await fetch(`http://localhost:3000/notes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } else {
    response = await fetch("http://localhost:3000/notes", {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
  }

  return response;
}

async function fetchWithAuth(method: string, payload?: any) {
  if (!["GET", "POST", "PATCH", "DELETE"].includes(method)) {
    return undefined;
  }

  const accessToken = getSecret("accessToken");
  if (!accessToken) {
    return { success: false, message: "Not authenticated" };
  }
  // accessToken += "1";

  try {
    let response = await noteAction(method, accessToken, payload);

    if (response.status === 403) {
      console.log("oh no");
      const refreshed = await tryRefreshToken();
      console.log(refreshed);
      if (!refreshed) {
        // refresh token also expired — force re-login
        sendForceLogout();
        return undefined;
      }

      const newAccessToken = getSecret("accessToken");
      response = await noteAction(method, newAccessToken!, payload);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `${method} request failed: ${response.status} - ${data.message}`,
      );
    }

    return data;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getSecret("refreshToken");
  if (!refreshToken) return false;

  const response = await fetch("http://localhost:3000/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) return false;

  const { accessToken, refreshToken: newRefreshToken } = await response.json();

  saveSecret("accessToken", accessToken);
  saveSecret("refreshToken", newRefreshToken);

  return true;
}

export const getAllNotes = async (): Promise<Note[]> => {
  console.log(await isOnline());
  if ((await isOnline()) && session.isLoggedIn) {
    const data = await fetchWithAuth("GET");

    if (!data) {
      return db.getAllNotes();
    }

    const remoteNotes: Note[] = data.notes;
    const localNotes: Note[] = db.getAllNotes();
    console.log(remoteNotes);
    console.log(localNotes);

    const remoteMap = new Map(remoteNotes.map((n) => [n.id, n]));
    const localMap = new Map(localNotes.map((n) => [n.id, n]));

    const allIds = new Set([...remoteMap.keys(), ...localMap.keys()]);

    for (const id of allIds) {
      const remote = remoteMap.get(id);
      const local = localMap.get(id);

      if (local && !remote) {
        await fetchWithAuth("POST", local);
      } else if (!local && remote) {
        db.setNote(remote);
      } else {
        if (local!.updated_at > remote!.updated_at) {
          await fetchWithAuth("PATCH", local);
        } else if (remote!.updated_at > local!.updated_at) {
          db.setNote(remote!);
        }
      }
    }

    return db.getAllNotes();
  } else {
    return db.getAllNotes();
  }
};

export const createNote = async (): Promise<Note> => {
  const note: Note = db.createNote();

  if ((await isOnline()) && session.isLoggedIn) {
    await fetchWithAuth("POST", note);
  }

  return note;
};

export const updateNote = async (params: {
  id: string;
  title: string;
  content: string;
}): Promise<Note> => {
  const note = db.updateNote(params);

  if ((await isOnline()) && session.isLoggedIn) {
    await fetchWithAuth("PATCH", note);
  }

  return note;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const note = db.deleteNote(id);

  if ((await isOnline()) && session.isLoggedIn) {
    await fetchWithAuth("DELETE", { id });
  }

  return note;
};
