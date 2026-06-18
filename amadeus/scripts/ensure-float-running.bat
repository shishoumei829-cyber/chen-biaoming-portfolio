@echo off

setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0.."



where node >nul 2>&1

if errorlevel 1 (

  echo [X] Node.js not found: https://nodejs.org

  exit /b 2

)



set "PORT=3001"

if exist ".env" for /f "usebackq tokens=1,* delims==" %%a in (".env") do (

  if /I "%%a"=="AMADEUS_BACKEND_PORT" set "PORT=%%b"

)

set "PORT=%PORT: =%"

if "%PORT%"=="" set "PORT=3001"



if not defined AMADEUS_BACKEND_PORT set AMADEUS_BACKEND_PORT=%PORT%

if not defined AMADEUS_FLOAT_AUTOSTART set AMADEUS_FLOAT_AUTOSTART=0
if not defined AMADEUS_FLOAT_START_HIDDEN set AMADEUS_FLOAT_START_HIDDEN=0

if not defined AMADEUS_FLOAT_HOTKEY set AMADEUS_FLOAT_HOTKEY=Alt+Shift+K



echo [%date% %time%] ensure-float port=%AMADEUS_BACKEND_PORT%



powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0amadeus-ready.ps1" -Base "http://127.0.0.1:%AMADEUS_BACKEND_PORT%" >nul 2>&1

if errorlevel 1 (

  echo [.] starting backend

  start "" /B "%~dp0start-backend-bg.bat"

  set /a N=0

  :wait_be

  ping -n 3 127.0.0.1 >nul

  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0amadeus-ready.ps1" -Base "http://127.0.0.1:%AMADEUS_BACKEND_PORT%" >nul 2>&1

  if not errorlevel 1 goto :be_ok

  set /a N+=1

  if !N! LSS 30 goto :wait_be

  echo [X] backend not ready on port %AMADEUS_BACKEND_PORT%

  exit /b 3

)



:be_ok

if not exist "node_modules\electron\package.json" (

  echo [.] installing electron

  call npm install electron --no-audit --no-fund

  if errorlevel 1 exit /b 4

)



echo [.] starting electron float tray

start "" /B "%~dp0start-electron-float.bat"

exit /b 0

