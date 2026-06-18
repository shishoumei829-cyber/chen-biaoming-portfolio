$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Cursor 本地模式一键启动 ===" -ForegroundColor Cyan
Write-Host "将打开两个窗口："
Write-Host "  1) 本地 worker（管你电脑上的项目）"
Write-Host "  2) 手机中继网页服务"
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$here\start-worker.ps1`""
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$here\start.ps1`""

Write-Host "已启动。手机访问见 start.ps1 输出里的 IP 地址。" -ForegroundColor Green
