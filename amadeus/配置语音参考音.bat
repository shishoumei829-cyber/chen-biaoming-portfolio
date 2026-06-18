@echo off
setlocal EnableExtensions
title Amadeus SoVITS ref.wav
cd /d "%~dp0"

echo.
echo 当前 TTS 需要 GPT-SoVITS 的参考音频 ref.wav
echo 在 Amadeus_Project\.env 中增加一行（把路径改成你本机真实路径）：
echo.
echo   AMADEUS_SOVITS_ROOT=D:\你的\GPT-SoVITS目录
echo   或
echo   AMADEUS_SOVITS_REF=D:\你的\GPT-SoVITS\ref.wav
echo.
echo 配置后重启 run_backend.bat，浏览器打开：
echo   http://127.0.0.1:3001/tts-health
echo   应看到 refReady=true
echo.
set /p "ROOT=请输入 GPT-SoVITS 目录（含 ref.wav，直接回车跳过写入）: "
if "%ROOT%"=="" goto :done
if not exist "%ROOT%\ref.wav" (
  echo [X] 该目录下没有 ref.wav: %ROOT%
  pause
  exit /b 1
)

set "ENV_FILE=%~dp0.env"
if not exist "%ENV_FILE%" copy "%~dp0env.example" "%ENV_FILE%" >nul

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p='%ENV_FILE%'; $lines=Get-Content -LiteralPath $p -ErrorAction SilentlyContinue; if(-not $lines){$lines=@()}; $lines=$lines|Where-Object{$_ -notmatch '^AMADEUS_SOVITS_ROOT=' -and $_ -notmatch '^AMADEUS_SOVITS_REF='}; $lines+=('AMADEUS_SOVITS_ROOT=%ROOT%'); Set-Content -LiteralPath $p -Value $lines -Encoding UTF8"

echo [OK] 已写入 AMADEUS_SOVITS_ROOT=%ROOT%
echo 请重启后端。

:done
pause
endlocal
