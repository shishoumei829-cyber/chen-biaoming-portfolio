@echo off
cd /d "%~dp0.."
if not defined AMADEUS_BACKEND_PORT set AMADEUS_BACKEND_PORT=3001
set AMADEUS_CHAT_MINIMAL=1
node server.js
