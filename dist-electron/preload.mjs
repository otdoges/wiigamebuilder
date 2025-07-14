"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
electron.contextBridge.exposeInMainWorld("electronAPI", {
  buildWiiGame: (buildData) => electron.ipcRenderer.invoke("build-wii-game", buildData),
  openDevTools: () => electron.ipcRenderer.invoke("open-dev-tools"),
  saveProject: (projectData) => electron.ipcRenderer.invoke("save-project", projectData),
  loadProject: () => electron.ipcRenderer.invoke("load-project"),
  exportGame: (gameData) => electron.ipcRenderer.invoke("export-game", gameData)
});
