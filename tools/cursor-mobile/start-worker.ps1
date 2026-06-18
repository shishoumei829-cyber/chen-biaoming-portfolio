param(
  [string]$Name = "",
  [string]$WorkerDir = ""
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

if (-not (Test-Path ".env")) {
  Write-Error "缺少 .env，请先运行 start.ps1 或复制 .env.example"
}

function Read-EnvValue([string]$key) {
  Get-Content ".env" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.StartsWith("$key=")) {
      return $line.Substring($key.Length + 1).Trim()
    }
  }
  return ""
}

$apiKey = Read-EnvValue "CURSOR_API_KEY"
$workerName = if ($Name) { $Name } else { Read-EnvValue "WORKER_NAME" }
if (-not $workerName) { $workerName = "shikimori-desktop" }
$dir = if ($WorkerDir) { $WorkerDir } else { Read-EnvValue "WORKER_DIR" }
if (-not $dir) {
  $dir = (Resolve-Path (Join-Path $here "..\..")).Path
}

if (-not (Get-Command agent -ErrorAction SilentlyContinue)) {
  Write-Host "未检测到 agent CLI，正在安装..." -ForegroundColor Yellow
  irm 'https://cursor.com/install?win32=true' | iex
  & "$here\fix-agent-cli.ps1"
}

if (-not $apiKey) {
  Write-Error "请在 .env 中填写 CURSOR_API_KEY"
}

Write-Host "启动本地 worker..." -ForegroundColor Cyan
Write-Host "名称: $workerName"
Write-Host "目录: $dir"
Write-Host "保持此窗口打开，关闭即停止 worker。" -ForegroundColor Yellow

Set-Location $dir
$env:CURSOR_API_KEY = $apiKey
agent worker start --name $workerName --api-key $apiKey
