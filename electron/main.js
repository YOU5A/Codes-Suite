const { app, BrowserWindow, ipcMain, dialog, shell, Tray, Menu, nativeTheme } = require("electron");
const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");
const { PythonBridge } = require("./python-bridge");

let mainWindow = null;
let pythonBridge = null;
let tray = null;

const isDev = !app.isPackaged;

// Fix GPU cache permission errors by setting a custom cache path
app.setPath('userData', path.join(app.getPath('appData'), 'CodesSuite'));



function ensureAdmin() {
  if (process.platform !== "win32") return;
  try {
    execSync("net session", { stdio: "ignore" });
    return;
  } catch {}
  // Not admin: elevate via PowerShell with Base64 to avoid quoting issues
  try {
    const electronPath = process.execPath.replace(/'/g, "''");
    let psCmd;
    if (app.isPackaged) {
      psCmd = `Start-Process -FilePath '${electronPath}' -Verb RunAs`;
    } else {
      const workDir = process.cwd().replace(/'/g, "''");
      psCmd = `Start-Process -FilePath '${electronPath}' -ArgumentList '.' -WorkingDirectory '${workDir}' -Verb RunAs`;
    }
    const encoded = Buffer.from(psCmd, "utf16le").toString("base64");
    const result = spawnSync("powershell", ["-NoProfile", "-EncodedCommand", encoded], {
      stdio: "pipe",
      windowsHide: true,
      encoding: "utf-8",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(result.stderr.trim() || `Exit code ${result.status}`);
  } catch (err) {
    console.error("[Admin] Elevation failed:", err.message);
    if (err.stderr) console.error("[Admin] stderr:", err.stderr.toString().trim());
  }
  app.quit();
}
ensureAdmin();
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    frame: false,
    thickFrame: false,
frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    titleBarStyle: "hidden",
    shadow: false,
    icon: path.join(__dirname, "..", "icon.ico"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => { mainWindow.show(); });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => { mainWindow = null; });
}

function setupIPC() {
  ipcMain.handle("window:minimize", () => mainWindow?.minimize());
  ipcMain.handle("window:maximize", () => {
    if (mainWindow?.isMaximized()) { mainWindow.unmaximize(); return false; }
    else { mainWindow?.maximize(); return true; }
  });
  ipcMain.handle("window:close", () => mainWindow?.close());
  ipcMain.handle("window:isMaximized", () => mainWindow?.isMaximized());
  ipcMain.handle("window:setOpacity", (_e, opacity) => { mainWindow?.setOpacity(opacity); });
  ipcMain.handle("window:getPosition", () => mainWindow?.getPosition());
  ipcMain.handle("window:getSize", () => mainWindow?.getSize());
  ipcMain.handle("window:setPosition", (_e, x, y) => { mainWindow?.setPosition(x, y); });
  ipcMain.handle("python:call", async (_event, method, params) => {
    if (!pythonBridge) return { error: "Python bridge not ready" };
    try { return await pythonBridge.call(method, params); }
    catch (e) { return { error: e.message }; }
  });
  ipcMain.handle("python:status", () => pythonBridge?.isRunning ?? false);

  ipcMain.handle("dialog:openFolder", async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"] });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle("dialog:openFile", async (_event, filters) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openFile"],
      filters: filters ? [filters] : [],
    });
    return result.canceled ? null : result.filePaths[0];
  });
  ipcMain.handle("dialog:saveFile", async (_event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result.canceled ? null : result.filePath;
  });
  ipcMain.handle("shell:openPath", async (_event, filePath) => shell.openPath(filePath));
  ipcMain.handle("shell:openExternal", async (_event, url) => shell.openExternal(url));
  ipcMain.handle("app:getPath", async (_event, name) => app.getPath(name));
}

function startPythonBridge() {
  const bridgePath = isDev
    ? path.join(__dirname, "..", "bridge", "server.py")
    : path.join(process.resourcesPath, "bridge", "server.py");
  pythonBridge = new PythonBridge(bridgePath);
  pythonBridge.start();
  app.on("before-quit", () => { pythonBridge?.stop(); });
}


function createTray() {
  const iconPath = isDev ? path.join(__dirname, "..", "icon.ico") : path.join(process.resourcesPath, "icon.ico");
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: "Show Codes Suite", click: () => mainWindow?.show() },
    { type: "separator" },
    { label: "Quit", click: () => { app.quit(); } },
  ]);
  tray.setToolTip("Codes Suite");
  tray.setContextMenu(contextMenu);
  tray.on("click", () => { if (mainWindow) { mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show(); } });
}

app.whenReady().then(() => {

  setupIPC();
  startPythonBridge();
  createWindow();
  createTray();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (mainWindow) {
    mainWindow.on("maximize", () => { mainWindow?.webContents.send("window:maximizeChange", true); });
    mainWindow.on("unmaximize", () => { mainWindow?.webContents.send("window:maximizeChange", false); });
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
