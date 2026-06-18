@echo off
setlocal EnableExtensions
title Amadeus 悬浮窗

cd /d "%~dp0"
if not exist "package.json" (
  echo [X] 请在 Amadeus_Project 目录运行本脚本。
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  echo [X] 未检测到 Node.js。请安装: https://nodejs.org
  pause
  exit /b 1
)

set "PORT=3001"
if exist ".env" for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
  if /I "%%a"=="AMADEUS_BACKEND_PORT" set "PORT=%%b"
)
set "PORT=%PORT: =%"
if "%PORT%"=="" set "PORT=3001"
set "AMADEUS_BACKEND_PORT=%PORT%"

echo [.] 检查后端端口 %PORT% ...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:%PORT%" >nul 2>&1
if errorlevel 1 (
  echo [.] 启动后端...
  start "Amadeus-Backend" /D "%CD%" cmd /k "set AMADEUS_BACKEND_PORT=%PORT%&& "%~dp0run_backend.bat""
  echo [.] 等待后端就绪...
  set /a N=0
  :wait_health
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:%PORT%" >nul 2>&1
  if %errorlevel%==0 goto :backend_ok
  set /a N+=1
  if %N% GEQ 45 goto :fail_backend
  timeout /t 2 /nobreak >nul
  goto :wait_health
) else (
  echo [OK] 后端已在运行。
)

:backend_ok
if not exist "node_modules\electron\package.json" (
  echo [.] 安装 Electron（仅首次）...
  call npm install electron --no-audit --no-fund
  if errorlevel 1 (
    echo [X] Electron 安装失败
    pause
    exit /b 1
  )
)

set AMADEUS_BACKEND_PORT=%PORT%
set AMADEUS_FLOAT_START_HIDDEN=0
set AMADEUS_FLOAT_AUTOSTART=0
set AMADEUS_FLOAT_HOTKEY=Alt+Shift+K
echo [.] 正在打开悬浮窗（启动后会自动弹出）...
start "Amadeus-Float" /D "%CD%" cmd /c "set AMADEUS_BACKEND_PORT=%PORT%&& set AMADEUS_FLOAT_START_HIDDEN=0&& set AMADEUS_FLOAT_AUTOSTART=0&& set AMADEUS_FLOAT_HOTKEY=Alt+Shift+K&& npm start"
echo [OK] 若未看到窗口：看任务栏是否有 Amadeus 图标，或按 Alt+Shift+K。
echo     开机自启请运行「配置悬浮窗快捷键.bat」（那时才后台隐藏）。
timeout /t 3 /nobreak >nul
exit /b 0

:fail_backend
echo [X] 后端未在端口 %PORT% 上就绪，请查看 Amadeus-Backend 窗口报错。
pause
exit /b 1
