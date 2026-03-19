import path from "path";
import { app, BrowserWindow } from "electron";

import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { db, SQLiteDatabase } from "./sqlite.js";
import { setUpAuthHandler, setUpSQLiteHandler } from "./ipcHandlers.js";
import { session } from "./session.js";

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }

  setUpSQLiteHandler(db);
  setUpAuthHandler();

  console.log(session.userId);
});

app.on("window-all-closed", () => {
  db.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
