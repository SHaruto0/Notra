import { ipcMain, WebFrameMain } from "electron";
import { pathToFileURL } from "url";
import { getUIPath } from "./pathResolver.js";
import { session } from "./session.js";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (
    ...args: EventPayloadMapping[Key]["args"]
  ) =>
    | EventPayloadMapping[Key]["return"]
    | Promise<EventPayloadMapping[Key]["return"]>,
) {
  ipcMain.handle(key, (event, ...args: EventPayloadMapping[Key]["args"]) => {
    console.log(key);
    if (event.senderFrame) {
      validateEventFrame(event.senderFrame);
    }
    return handler(...args);
  });
}

export function validateEventFrame(frame: WebFrameMain) {
  console.log(frame.url);
  if (isDev() && new URL(frame.url).host === "localhost:5123") {
    return;
  }
  if (frame.url !== pathToFileURL(getUIPath()).toString()) {
    throw new Error("Malicious event");
  }
}

export async function noteActions(method: string, payload?: any) {
  if (!["GET", "POST", "PATCH", "DELETE"].includes(method)) {
    return undefined;
  }

  try {
    let response;

    if (method === "GET") {
      response = await fetch(
        `http://localhost:3000/notes?user_id=${session.user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      response = await fetch("http://localhost:3000/notes", {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
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

export async function isOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    await fetch("http://localhost:3000/health", {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}
