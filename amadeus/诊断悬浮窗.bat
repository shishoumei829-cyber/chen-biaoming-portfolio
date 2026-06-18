@echo off

setlocal EnableExtensions

title Amadeus 悬浮窗诊断

cd /d "%~dp0"



echo.

echo === 悬浮窗诊断（会弹出窗口，请勿隐藏模式）===

echo.



where node >nul 2>&1 || (echo [X] 未安装 Node.js & goto :end)

if not exist "node_modules\electron\package.json" (

  echo [.] 安装 Electron...

  call npm install electron --no-audit --no-fund

)



set "PORT=3001"

if exist ".env" for /f "usebackq tokens=1,* delims==" %%a in (".env") do (

  if /I "%%a"=="AMADEUS_BACKEND_PORT" set "PORT=%%b"

)

set "PORT=%PORT: =%"



set AMADEUS_BACKEND_PORT=%PORT%

set AMADEUS_FLOAT_START_HIDDEN=0

set AMADEUS_FLOAT_AUTOSTART=0

set AMADEUS_FLOAT_HOTKEY=Alt+Shift+K



powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:%PORT%" >nul 2>&1

if errorlevel 1 (

  echo [!] 后端未就绪，先启动后端...

  start "Amadeus-Backend" /D "%CD%" cmd /k "set AMADEUS_BACKEND_PORT=%PORT%&& run_backend.bat"

  echo 等待 10 秒...

  timeout /t 10 /nobreak >nul

)



echo [.] 启动 Electron（应自动弹出悬浮窗）...

call npm start



:end

echo.

pause

endlocal

