@echo off

setlocal EnableExtensions

title Amadeus one-click



cd /d "%~dp0"

if not exist "package.json" (

  echo [X] 请在本项目目录运行一键启动。

  pause

  exit /b 1

)



where node >nul 2>&1

if errorlevel 1 (

  echo [X] 未检测到 Node.js。请安装: https://nodejs.org

  pause

  exit /b 1

)



if not exist "node_modules\express\package.json" (

  echo [.] 依赖未安装，先运行 run_backend.bat ...

  call "%~dp0run_backend.bat"

  if errorlevel 1 exit /b 1

)



REM 读取 .env 中的端口（默认 3001，避免与 TimeWalker/Vite 占用的 3000 冲突）

set "PORT=3001"

if exist ".env" for /f "usebackq tokens=1,* delims==" %%a in (".env") do (

  if /I "%%a"=="AMADEUS_BACKEND_PORT" set "PORT=%%b"

)

set "PORT=%PORT: =%"

if "%PORT%"=="" set "PORT=3001"



echo [.] 检查端口 %PORT% ...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:%PORT%" >nul 2>&1

if errorlevel 1 (

  echo [.] 启动后端（端口 %PORT%）...

  start "Amadeus-Backend" /D "%CD%" cmd /k "set AMADEUS_BACKEND_PORT=%PORT%&& "%~dp0run_backend.bat""

) else (

  echo [OK] 后端已在端口 %PORT% 运行。

)



echo [.] 等待 Amadeus 就绪（非其它程序的 404）...

set /a N=0

:wait_health

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:%PORT%" >nul 2>&1

if %errorlevel%==0 goto :open_ui

set /a N+=1

if %N% GEQ 45 goto :fail



REM 若 3000 被占用且我们用的是 3001，提示用户

if %N%==5 if not "%PORT%"=="3000" (

  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\amadeus-ready.ps1" -Base "http://127.0.0.1:3000" >nul 2>&1

  if errorlevel 1 (

    echo [提示] 端口 3000 可能被其它程序占用（如 TimeWalker/Vite），Amadeus 使用 %PORT%

  ) else (

    echo [警告] 3000 上有服务但可能不是 Amadeus，请用端口 %PORT%

  )

)

timeout /t 2 /nobreak >nul

goto :wait_health



:open_ui

set "PAGE=http://127.0.0.1:%PORT%/amadeus_work.html"

echo [OK] 打开 %PAGE%

start "" "%PAGE%"

echo.

echo 若仍打不开：运行「诊断端口.bat」查看谁占用了 3000。

pause

exit /b 0



:fail

echo.

echo [X] Amadeus 未在端口 %PORT% 上就绪。

echo     请查看 Amadeus-Backend 窗口中的报错。

echo     运行: 诊断端口.bat

pause

exit /b 1

endlocal

