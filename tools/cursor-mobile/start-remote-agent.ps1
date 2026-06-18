param(
  [int]$Port = 48989,
  [switch]$Tailscale,
  [switch]$SameLan
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error "需要 Node.js 和 npx"
}

$args = @("-y", "@kimuson/remote-agent@latest", "serve", "--port", "$Port")

if ($Tailscale) {
  $args += "--tailscale"
} elseif ($SameLan) {
  $args += "--same-lan"
} else {
  Write-Host "默认仅本机 HTTP。出门建议加 -Tailscale 或 -SameLan" -ForegroundColor Yellow
}

Write-Host "启动 remote-agent（本机 Cursor CLI 遥控）..." -ForegroundColor Cyan
Write-Host "首次运行会下载依赖，请稍等。"
Write-Host "在网页里选择 Provider: Cursor CLI，工作目录选你的项目文件夹。"
Write-Host ""

& npx @args
