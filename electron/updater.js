"use strict";

const { app, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");

let winRef = null;

function broadcast(state) {
  if (winRef && !winRef.isDestroyed()) {
    winRef.webContents.send("grid:update-status", state);
  }
}

function initUpdater(getWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  // Paketlenmemiş geliştirme modunda dev-app-update.yml kullanarak da test edilebilir
  if (!app.isPackaged) {
    autoUpdater.forceDevUpdateConfig = true;
  }

  autoUpdater.on("checking-for-update", () => {
    broadcast({ status: "checking" });
  });

  autoUpdater.on("update-available", (info) => {
    broadcast({ status: "available", version: info.version });
  });

  autoUpdater.on("update-not-available", () => {
    broadcast({ status: "up-to-date" });
  });

  autoUpdater.on("download-progress", (progress) => {
    broadcast({
      status: "downloading",
      percent: Math.round(progress.percent),
    });
  });

  autoUpdater.on("update-downloaded", (info) => {
    broadcast({ status: "ready", version: info.version });
  });

  autoUpdater.on("error", (err) => {
    broadcast({
      status: "error",
      message: String((err && err.message) || err),
    });
  });

  ipcMain.on("grid:check-updates", () => {
    winRef = getWindow();
    autoUpdater.checkForUpdates().catch(() => {});
  });

  ipcMain.on("grid:install-update", () => {
    autoUpdater.quitAndInstall();
  });
}

function checkForUpdatesSoon(getWindow) {
  winRef = getWindow();
  const check = () => {
    winRef = getWindow();
    if (!winRef || winRef.isDestroyed()) return;
    autoUpdater.checkForUpdates().catch(() => {});
  };
  // Pencere açılışını yavaşlatmamak için kısa gecikmeyle başla
  setTimeout(check, 3000);
}

module.exports = { initUpdater, checkForUpdatesSoon };