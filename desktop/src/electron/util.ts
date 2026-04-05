import { ipcMain, WebContents, WebFrameMain } from "electron";
import { pathToFileURL } from "url";
import { getUIPath } from "./pathResolver.js";

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

export function ipcWebContentsSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  webContents: WebContents,
  payload: EventPayloadMapping[Key]["return"],
) {
  webContents.send(key, payload);
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
