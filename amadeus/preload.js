'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('amadeusWin', {
  onSystemWakeup(callback) {
    ipcRenderer.on('system-wakeup', (_event, type) => callback(type));
  },

  offSystemWakeup() {
    ipcRenderer.removeAllListeners('system-wakeup');
  },

  platform: process.platform,

  /** 主进程轮询光标移动窗口（Windows 透明窗最稳） */
  dragStart(screenX, screenY) {
    ipcRenderer.send('float:drag-start', screenX, screenY);
  },
  dragEnd() {
    ipcRenderer.send('float:drag-end');
  },

  onFloatShown(callback) {
    ipcRenderer.on('float-window-shown', () => callback());
  },
});
