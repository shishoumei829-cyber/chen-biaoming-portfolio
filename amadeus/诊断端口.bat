@echo off

setlocal

cd /d "%~dp0"

echo === 端口占用 ===

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\who-owns-port.ps1" -Port 3000

echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\who-owns-port.ps1" -Port 3001

echo.

echo === 是否为 Amadeus 后端 ===

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:3000"

echo 3000 ready exit=%errorlevel%

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:3001"

echo 3001 ready exit=%errorlevel%

echo.

pause

endlocal

