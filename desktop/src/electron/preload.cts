import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("db", {
  getAllNotes: () => ipcInvoke("getAllNotes"),
  createNote: () => ipcInvoke("createNote"),
  updateNote: (params) => ipcInvoke("updateNote", params),
  deleteNote: (id) => ipcInvoke("deleteNote", id),
} satisfies Window["db"]);

contextBridge.exposeInMainWorld("auth", {
  login: (params) => ipcInvoke("login", params),
  register: (params) => ipcInvoke("register", params),
  logout: () => ipcInvoke("logout"),
  forceLogout: (callback) => {
    return ipcOn("forceLogout", () => callback());
  },
} satisfies Window["auth"]);

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key,
  ...args: EventPayloadMapping[Key]["args"]
): Promise<EventPayloadMapping[Key]["return"]> {
  return ipcRenderer.invoke(key, ...args);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]["return"]) => void,
) {
  const cb = (
    _: Electron.IpcRendererEvent,
    payload: EventPayloadMapping[Key]["return"],
  ) => callback(payload);

  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb);
}
