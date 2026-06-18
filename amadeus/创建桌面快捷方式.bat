@echo off
setlocal EnableExtensions
title Create Amadeus Desktop Shortcut

cd /d "%~dp0"
set "TARGET=%~dp0一键启动.bat"
set "WORKDIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"
set "LNK=%DESKTOP%\Amadeus 一键启动.lnk"

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
  "$s.Description = 'Amadeus Kurisu (port 3001 default)';" ^
  "$s.Save()"

if exist "%LNK%" (
  echo [OK] 已创建: %LNK%
  echo 请使用桌面上的「Amadeus 一键启动」，可删除旧的损坏快捷方式。
) else (
  echo [X] 创建失败
)
pause
endlocal
