@echo off
setlocal EnableExtensions
title 创建 Amadeus 悬浮窗桌面快捷方式

cd /d "%~dp0"
echo 推荐：运行「配置悬浮窗快捷键.bat」一次即可，之后只用 Alt+Shift+K。
echo.
set "TARGET=%~dp0配置悬浮窗快捷键.bat"
set "WORKDIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "LNK=%DESKTOP%\Amadeus 配置快捷键.lnk"

if not exist "%TARGET%" (
  echo [X] 找不到: %TARGET%
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('%LNK%');" ^
  "$s.TargetPath = '%TARGET%';" ^
  "$s.WorkingDirectory = '%WORKDIR%';" ^
  "$s.WindowStyle = 1;" ^
  "$s.Description = 'Amadeus 一键配置 Alt+Shift+K';" ^
  "$s.Save()"

if exist "%LNK%" (
  echo [OK] 已创建: %LNK%
  echo 双击运行一次配置，之后按 Alt+Shift+K 即可。
) else (
  echo [X] 创建失败
)
pause
endlocal
