"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("grid", {
  syncPanels(panels) {
    ipcRenderer.send("grid:sync-panels", panels);
  },
  setLayout(rects) {
    ipcRenderer.send("grid:set-layout", rects);
  },
  navigate(id, url) {
    ipcRenderer.send("grid:navigate", { id, url });
  },
  reload(id) {
    ipcRenderer.send("grid:reload", id);
  },
  back(id) {
    ipcRenderer.send("grid:back", id);
  },
  forward(id) {
    ipcRenderer.send("grid:forward", id);
  },
  toggleSleep(id) {
    ipcRenderer.send("grid:sleep", id);
  },
  fullscreen() {
    ipcRenderer.send("grid:fullscreen");
  },
  setAutoHide(on) {
    ipcRenderer.send("grid:set-autohide", !!on);
  },
  onToolbarState(callback) {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on("grid:toolbar-state", listener);
    return () => ipcRenderer.removeListener("grid:toolbar-state", listener);
  },
  onFullscreenState(callback) {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on("grid:fullscreen-state", listener);
    return () => ipcRenderer.removeListener("grid:fullscreen-state", listener);
  },
  onState(callback) {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("grid:state", listener);
    return () => ipcRenderer.removeListener("grid:state", listener);
  },
  onUpdateStatus(callback) {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on("grid:update-status", listener);
    return () => ipcRenderer.removeListener("grid:update-status", listener);
  },
  checkForUpdates() {
    ipcRenderer.send("grid:check-updates");
  },
  installUpdate() {
    ipcRenderer.send("grid:install-update");
  },
  getVersion() {
    return ipcRenderer.invoke("grid:get-version");
  },
  getInstallerLang() {
    return ipcRenderer.invoke("grid:get-installer-lang");
  },
  setSettingsOverlay(open) {
    ipcRenderer.send("grid:set-settings-overlay", !!open);
  },
});