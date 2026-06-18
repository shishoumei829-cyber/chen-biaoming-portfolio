const { app, BrowserWindow, Menu, Tray, globalShortcut, powerMonitor, dialog, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { spawn } = require('child_process');

app.commandLine.appendSwitch('enable-transparent-visuals');

/** 关闭 GPU 可能导致 Windows 透明窗变黑，仅在有需要时设 AMADEUS_DISABLE_GPU=1 */
if (String(process.env.AMADEUS_DISABLE_GPU || '').trim() === '1') {
  app.disableHardwareAcceleration();
}

let floatDragState = null;
let floatDragTimer = null;

function setupFloatWindowDragIpc() {
  ipcMain.on('float:drag-start', (event, screenX, screenY) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win || win.isDestroyed()) return;
    const [x, y] = win.getPosition();
    floatDragState = {
      win,
      offsetX: screenX - x,
      offsetY: screenY - y,
    };
    if (floatDragTimer) clearInterval(floatDragTimer);
    floatDragTimer = setInterval(() => {
      if (!floatDragState?.win || floatDragState.win.isDestroyed()) {
        clearInterval(floatDragTimer);
        floatDragTimer = null;
        floatDragState = null;
        return;
      }
      const cur = screen.getCursorScreenPoint();
      floatDragState.win.setPosition(
        Math.round(cur.x - floatDragState.offsetX),
        Math.round(cur.y - floatDragState.offsetY),
      );
    }, 10);
  });

  ipcMain.on('float:drag-end', () => {
    if (floatDragTimer) {
      clearInterval(floatDragTimer);
      floatDragTimer = null;
    }
    floatDragState = null;
  });
}

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

let tray = null;
let mainWindow = null;
let backendProcess = null;
const BACKEND_PORT = Number(process.env.AMADEUS_BACKEND_PORT) || 3001;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const FLOAT_HOTKEY = String(process.env.AMADEUS_FLOAT_HOTKEY || 'Alt+Shift+K').trim() || 'Alt+Shift+K';
/** 仅开机自启脚本设为 1；手动「启动悬浮窗」默认直接显示窗口 */
const FLOAT_AUTOSTART = String(process.env.AMADEUS_FLOAT_AUTOSTART || '').trim() === '1';
const FLOAT_START_HIDDEN = FLOAT_AUTOSTART
  || String(process.env.AMADEUS_FLOAT_START_HIDDEN || '0').trim() === '1';
const FLOAT_PAGE = `${BACKEND_URL}/amadeus_work.html?ui=float&hotkey=${encodeURIComponent(FLOAT_HOTKEY)}`;

function resolveIconPath() {
  const candidates = [
    path.join(__dirname, 'assets', 'icon.png'),
    path.join(__dirname, 'assets', 'Live2d', 'kurisu', '0.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return candidates[0];
}

function resolveBackendPaths() {
  const root = __dirname;
  return { root, serverPath: path.join(root, 'server.js') };
}

function isPortOpen(port, host = '127.0.0.1', timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;
    const finish = (ok) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
}

async function waitForBackendHealth(port, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    const portOk = await isPortOpen(port);
    if (portOk) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await fetch(`http://127.0.0.1:${port}/health`, { signal: AbortSignal.timeout(2500) });
        if (res.status === 200 || res.status === 503) {
          const j = await res.json();
          if (j && (typeof j.ready === 'boolean' || j.checks)) return true;
        }
      } catch (_) { /* retry */ }
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function ensureBackendRunning() {
  const alreadyRunning = await isPortOpen(BACKEND_PORT);
  if (alreadyRunning) {
    console.log(`[main] Backend already running on ${BACKEND_URL}`);
    return true;
  }

  const { root, serverPath } = resolveBackendPaths();
  if (!fs.existsSync(serverPath)) {
    console.error('[main] server.js not found:', serverPath);
    return false;
  }

  backendProcess = spawn(process.execPath, [serverPath], {
    cwd: root,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      AMADEUS_BACKEND_PORT: String(BACKEND_PORT),
    },
    stdio: 'ignore',
    windowsHide: true,
    detached: false,
  });

  backendProcess.once('error', (err) => {
    console.error('[main] Failed to start backend:', err.message);
  });
  backendProcess.once('exit', (code, signal) => {
    console.log(`[main] Backend exited (code=${code}, signal=${signal || 'none'})`);
    backendProcess = null;
  });

  const ready = await waitForBackendHealth(BACKEND_PORT, 18000);
  if (!ready) {
    console.warn('[main] Backend did not become ready in time; UI will still open.');
  }
  return ready;
}

function stopBackendProcess() {
  if (!backendProcess || backendProcess.killed) return;
  try {
    backendProcess.kill();
  } catch (e) {
    console.warn('[main] Failed to stop backend process:', e.message);
  }
}

function showFloatWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (!mainWindow.isVisible()) {
    mainWindow.show();
    try {
      const { width, height } = mainWindow.getBounds();
      const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
      mainWindow.setPosition(
        Math.max(0, Math.round((sw - width) / 2)),
        Math.max(0, Math.round((sh - height) / 4)),
      );
    } catch (_) { /* ignore */ }
  }
  mainWindow.focus();
  if (mainWindow.isMinimized()) mainWindow.restore();
  if (!mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('float-window-shown');
  }
}

function hideFloatWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.hide();
}

function toggleWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (mainWindow.isVisible()) hideFloatWindow();
  else showFloatWindow();
}

function registerFloatHotkey() {
  globalShortcut.unregisterAll();
  let hotkeyLabel = FLOAT_HOTKEY;
  let ok = globalShortcut.register(FLOAT_HOTKEY, () => toggleWindow());
  if (!ok) {
    console.warn(`[main] Hotkey register failed: ${FLOAT_HOTKEY}`);
    ok = globalShortcut.register('CommandOrControl+Shift+K', () => toggleWindow());
    if (ok) hotkeyLabel = 'Ctrl+Shift+K';
  }
  if (!ok) {
    console.warn('[main] No global hotkey registered');
    showFloatWindow();
  }
  return { ok, hotkeyLabel };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 360,
    height: 520,
    minWidth: 300,
    minHeight: 400,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    thickFrame: false,
    skipTaskbar: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      autoplayPolicy: 'no-user-gesture-required',
    },
    icon: resolveIconPath(),
  });

  mainWindow.setBackgroundColor('#00000000');
  mainWindow.webContents.setBackgroundThrottling(false);

  const showWhenReady = () => {
    if (!FLOAT_START_HIDDEN) showFloatWindow();
  };
  mainWindow.once('ready-to-show', showWhenReady);

  const loadWorkFloat = () => {
    const workFile = path.join(__dirname, 'amadeus_work.html');
    if (fs.existsSync(workFile)) {
      return mainWindow.loadFile(workFile, {
        query: { ui: 'float', port: String(BACKEND_PORT), hotkey: FLOAT_HOTKEY },
      });
    }
    return mainWindow.loadFile('amadeus_work.html');
  };

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.insertCSS(`
      html.float-mode, html.float-mode body {
        background: transparent !important;
        background-color: transparent !important;
      }
      html.float-mode #cp, html.float-mode #ch, html.float-mode #ia,
      html.float-mode #si, html.float-mode #sb {
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
      }
      html.float-mode #cp { pointer-events: none !important; }
      html.float-mode #ch, html.float-mode #ia, html.float-mode #float-drag-handle {
        pointer-events: auto !important;
      }
      html.float-mode .chdr { display: none !important; }
    `).catch(() => {});
    if (process.platform === 'win32' && typeof mainWindow.setBackgroundMaterial === 'function') {
      try { mainWindow.setBackgroundMaterial('none'); } catch (_) { /* older builds */ }
    }
    if (!FLOAT_START_HIDDEN) showFloatWindow();
  });

  let loadFallbackDone = false;
  mainWindow.webContents.on('did-fail-load', (_e, _code, _desc, url, isMainFrame) => {
    if (!isMainFrame || loadFallbackDone) return;
    loadFallbackDone = true;
    console.warn('[main] loadURL failed, fallback to file:', url);
    loadWorkFloat().catch((err) => console.error('[main] loadFile failed:', err.message));
  });

  mainWindow.loadURL(FLOAT_PAGE).catch((err) => {
    console.warn('[main] loadURL error:', err.message);
    loadWorkFloat().catch((e) => console.error('[main] loadFile failed:', e.message));
  });

  powerMonitor.on('resume', () => {
    if (mainWindow) mainWindow.webContents.send('system-wakeup', 'resume');
  });

  powerMonitor.on('unlock-screen', () => {
    if (mainWindow) mainWindow.webContents.send('system-wakeup', 'unlock');
  });

  mainWindow.webContents.on('context-menu', () => {
    const menu = Menu.buildFromTemplate([
      { label: '隐藏悬浮窗', click: () => hideFloatWindow() },
      { label: '退出 Amadeus', click: () => {
        app.isQuitting = true;
        app.quit();
      } },
      { type: 'separator' },
      { label: '调试模式', click: () => mainWindow.webContents.openDevTools({ mode: 'detach' }) },
    ]);
    menu.popup();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      hideFloatWindow();
    }
  });
}

function createTray(hotkeyLabel) {
  const iconPath = resolveIconPath();
  try {
    tray = new Tray(iconPath);
  } catch (e) {
    console.warn('[main] Tray icon failed:', e.message, iconPath);
    return false;
  }
  const hk = hotkeyLabel || FLOAT_HOTKEY;
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示悬浮窗', click: () => showFloatWindow() },
    { label: '隐藏悬浮窗', click: () => hideFloatWindow() },
    { type: 'separator' },
    { label: '退出程序', click: () => {
      app.isQuitting = true;
      app.quit();
    } },
  ]);
  tray.setToolTip(`Amadeus 悬浮窗 — ${hk} 或单击托盘`);
  tray.setContextMenu(contextMenu);
  tray.on('click', toggleWindow);
  if (FLOAT_START_HIDDEN) {
    try {
      tray.displayBalloon({
        title: 'Amadeus 已在后台',
        content: `按 ${hk} 打开悬浮窗；单击托盘图标也可显示`,
      });
    } catch (_) { /* 新版 Electron 可能不支持 */ }
  }
  return true;
}

async function bootstrap() {
  setupFloatWindowDragIpc();
  const ready = await ensureBackendRunning();
  if (!ready) {
    await dialog.showMessageBox({
      type: 'warning',
      title: 'Amadeus',
      message: '后端未能启动',
      detail: `请确认 Ollama 已启动，且端口 ${BACKEND_PORT} 未被占用。\n配置快捷键请运行「配置悬浮窗快捷键.bat」。`,
    });
  }
  createWindow();
  const { ok: hotkeyOk, hotkeyLabel } = registerFloatHotkey();
  const hasTray = createTray(hotkeyLabel);

  if (FLOAT_START_HIDDEN && !hotkeyOk) {
    await dialog.showMessageBox({
      type: 'info',
      title: 'Amadeus 悬浮窗',
      message: '窗口已在后台',
      detail: hasTray
        ? '快捷键注册失败：请从任务栏右下角托盘图标点击「显示悬浮窗」。'
        : '请重新运行「启动悬浮窗.bat」。',
    });
  } else if (!FLOAT_START_HIDDEN) {
    showFloatWindow();
  }

  if (process.env.AMADEUS_AUTO_LAUNCH === '1') {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: [],
    });
  }
}

if (gotSingleInstanceLock) {
  app.whenReady().then(bootstrap);

  app.on('second-instance', () => {
    showFloatWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showFloatWindow();
  });
}

app.on('will-quit', () => {
  if (floatDragTimer) clearInterval(floatDragTimer);
  globalShortcut.unregisterAll();
  stopBackendProcess();
});

app.on('window-all-closed', () => {
  /* 托盘常驻：不按关闭键退出进程 */
});
