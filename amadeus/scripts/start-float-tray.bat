@echo off

setlocal EnableExtensions

cd /d "%~dp0.."



set "PORT=3001"

if exist ".env" for /f "usebackq tokens=1,* delims==" %%a in (".env") do (

  if /I "%%a"=="AMADEUS_BACKEND_PORT" set "PORT=%%b"

)

set "PORT=%PORT: =%"

if "%PORT%"=="" set "PORT=3001"



set AMADEUS_BACKEND_PORT=%PORT%

set AMADEUS_FLOAT_AUTOSTART=1

set AMADEUS_FLOAT_START_HIDDEN=1

if not defined AMADEUS_FLOAT_HOTKEY set AMADEUS_FLOAT_HOTKEY=Alt+Shift+K



if not exist "logs" mkdir "logs" 2>nul

call "%~dp0ensure-float-running.bat" >> "logs\float-start.log" 2>&1

endlocal

