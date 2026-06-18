@echo off
setlocal EnableExtensions
title Amadeus 一键配置悬浮窗

cd /d "%~dp0"
echo.
echo  只需配置一次：
echo    - 开机自动后台运行（托盘）
echo    - 开机后按 Alt+Shift+K 打开（后台模式，不自动弹窗）
echo    - 若要立刻看到窗口请运行「启动悬浮窗.bat」
echo    - 与网页版同一人设/记忆/TTS（需 SoVITS 已启动才有声）
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-float-autostart.ps1"
if errorlevel 1 (
  echo [X] 配置失败。可查看 logs\float-start.log
  pause
  exit /b 1
)

echo.
echo [提示] 按 Alt+Shift+K 打开/关闭悬浮窗；托盘图标在任务栏右下角。
echo [提示] 若仍失败，请打开 logs\float-start.log 查看原因。
echo.
pause
endlocal
