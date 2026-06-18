@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "PDF=%~dp0resume-final.pdf"
set "TMP=%USERPROFILE%\Desktop\resume-export-tmp.pdf"

:: 先导出到桌面（避免中文路径导致 Chrome 写入失败）
"%CHROME%" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 --print-to-pdf="%TMP%" "file:///%~dp0resume.html"

if not exist "%TMP%" (
  echo 生成失败，请确认已安装 Chrome。
  pause
  exit /b 1
)

move /y "%TMP%" "%PDF%" >nul
echo 已生成：%PDF%
start "" "%PDF%"
