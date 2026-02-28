import { app, BrowserWindow } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { SQLiteDatabase } from "./sqlite.js";
import { setUpSQLiteHandler } from "./ipcHandlers.js";

let db: SQLiteDatabase;

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

  db = new SQLiteDatabase();

  setUpSQLiteHandler(db);
});

app.on("window-all-closed", () => {
  db.close();
  if (process.platform !== "darwin") {
    app.quit();
  }
});
