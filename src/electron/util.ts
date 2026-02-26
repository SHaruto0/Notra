import { ipcMain } from "electron";

export function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function ipcMainHandle<Key extends keyof EventPayloadMapping>(
  key: Key,
  handler: () => EventPayloadMapping[Key],
) {
  ipcMain.handle(key, () => handler());
}
