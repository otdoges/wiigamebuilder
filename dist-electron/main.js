import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const NEXTJS_DEV_URL = process.env["NEXTJS_DEV_URL"] || "http://localhost:3000";
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    titleBarStyle: "default",
    title: "Wii Game Builder"
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL(NEXTJS_DEV_URL);
    win.webContents.openDevTools();
  } else {
    win.loadURL(NEXTJS_DEV_URL);
  }
  win.webContents.on("did-finish-load", () => {
    console.log("Wii Game Builder loaded successfully");
    win == null ? void 0 : win.webContents.send("main-process-message", {
      type: "app-ready",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  win.on("closed", () => {
    win = null;
  });
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
ipcMain.handle("build-wii-game", async (event, buildData) => {
  var _a, _b;
  try {
    console.log("Building Wii game with data:", buildData);
    const buildResult = {
      success: true,
      message: "Wii game built successfully!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      components: ((_a = buildData.components) == null ? void 0 : _a.length) || 0,
      codeLines: ((_b = buildData.code) == null ? void 0 : _b.split("\n").length) || 0
    };
    return buildResult;
  } catch (error) {
    console.error("Build error:", error);
    return {
      success: false,
      message: `Build failed: ${error}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
});
ipcMain.handle("open-dev-tools", async () => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    focusedWindow.webContents.openDevTools();
  }
});
ipcMain.handle("save-project", async (event, projectData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: "Save Wii Game Project",
      defaultPath: "wii-game-project.json",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!result.canceled && result.filePath) {
      await fs.promises.writeFile(result.filePath, JSON.stringify(projectData, null, 2));
      return { success: true, filePath: result.filePath };
    }
    return { success: false, message: "Save cancelled" };
  } catch (error) {
    return { success: false, message: `Save failed: ${error}` };
  }
});
ipcMain.handle("load-project", async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: "Load Wii Game Project",
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] }
      ],
      properties: ["openFile"]
    });
    if (!result.canceled && result.filePaths.length > 0) {
      const fileContent = await fs.promises.readFile(result.filePaths[0], "utf-8");
      const projectData = JSON.parse(fileContent);
      return { success: true, data: projectData };
    }
    return { success: false, message: "Load cancelled" };
  } catch (error) {
    return { success: false, message: `Load failed: ${error}` };
  }
});
ipcMain.handle("export-game", async (event, gameData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: "Export Wii Game",
      defaultPath: "wii-game.wbf",
      filters: [
        { name: "Wii Build File", extensions: ["wbf"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });
    if (!result.canceled && result.filePath) {
      const exportData = {
        format: "Wii Game Builder",
        version: "1.0.0",
        exported: (/* @__PURE__ */ new Date()).toISOString(),
        game: gameData
      };
      await fs.promises.writeFile(result.filePath, JSON.stringify(exportData, null, 2));
      return { success: true, filePath: result.filePath };
    }
    return { success: false, message: "Export cancelled" };
  } catch (error) {
    return { success: false, message: `Export failed: ${error}` };
  }
});
export {
  MAIN_DIST,
  NEXTJS_DEV_URL,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
