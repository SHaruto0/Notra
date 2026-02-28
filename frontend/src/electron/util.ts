import { ipcMain, WebFrameMain } from "electron";
import { pathToFileURL } from "url";
import { getUIPath } from "./pathResolver.js";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

export function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: (
    ...args: EventPayloadMapping[Key]["args"]
  ) => EventPayloadMapping[Key]["return"],
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
