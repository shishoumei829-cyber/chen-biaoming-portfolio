param(
  [int]$Port = 0
)

$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "已创建 .env，请先填写 CURSOR_API_KEY 和 ACCESS_TOKEN 后再启动。" -ForegroundColor Yellow
  notepad ".env"
  exit 1
}

if ($Port -gt 0) {
  $content = Get-Content ".env" -Raw
  if ($content -match "(?m)^PORT=.*$") {
    $content = $content -replace "(?m)^PORT=.*$", "PORT=$Port"
  } else {
    $content += "`nPORT=$Port"
  }
  Set-Content ".env" $content -NoNewline
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "未找到 Node.js，请先安装 Node 18+"
}

Write-Host "启动 Cursor 手机中继..." -ForegroundColor Cyan
node server.js
