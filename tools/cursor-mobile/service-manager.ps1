param(
  [ValidateSet("start", "stop", "status", "restart")]
  [string]$Action = "status"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$PidFile = Join-Path $Root ".mobile-relay.pid"
$LogFile = Join-Path $LogDir "mobile-relay.log"
$Port = 4789
$ServerJs = Join-Path $Root "server.js"

function Read-EnvValue([string]$key) {
  $envPath = Join-Path $Root ".env"
  if (-not (Test-Path $envPath)) { return "" }
  Get-Content $envPath | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.StartsWith("$key=")) {
      return $line.Substring($key.Length + 1).Trim()
    }
  }
  return ""
}

function Ensure-Dirs {
  if (-not (Test-Path $LogDir)) { New-Item -ItemType Directory -Path $LogDir | Out-Null }
}

function Get-ListenerPid([int]$TargetPort) {
  $line = netstat -ano | findstr ":$TargetPort" | findstr LISTENING | Select-Object -First 1
  if (-not $line) { return $null }
  return [int](($line -split '\s+')[-1])
}

function Read-SavedPid {
  if (-not (Test-Path $PidFile)) { return $null }
  $raw = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1).Trim()
  if ($raw -match '^\d+$') { return [int]$raw }
  return $null
}

function Save-Pid([int]$ProcessId) {
  Set-Content -Path $PidFile -Value $ProcessId -NoNewline
}

function Test-Running {
  $pidFromPort = Get-ListenerPid $Port
  if ($pidFromPort) { return $true, $pidFromPort }
  $saved = Read-SavedPid
  if ($saved -and (Get-Process -Id $saved -ErrorAction SilentlyContinue)) { return $true, $saved }
  return $false, $null
}

function Get-PhoneUrl {
  $token = Read-EnvValue "ACCESS_TOKEN"
  $base = $null
  $tailscaleIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -like "100.*" } |
    Select-Object -First 1).IPAddress
  if ($tailscaleIp) { $base = "http://${tailscaleIp}:$Port" }
  else {
    $lanIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "198.18.*" } |
      Sort-Object InterfaceMetric |
      Select-Object -First 1).IPAddress
    if ($lanIp) { $base = "http://${lanIp}:$Port" }
    else { $base = "http://127.0.0.1:$Port" }
  }
  if ($token) { return "${base}/?token=$token" }
  return $base
}

function Start-MobileRelay {
  Ensure-Dirs
  $running, $existing = Test-Running
  if ($running) {
    Write-Host "[OK] RUNNING PID=$existing PORT=$Port"
    Write-Host "PHONE_URL=$(Get-PhoneUrl)"
    return
  }

  $node = (Get-Command node -ErrorAction SilentlyContinue).Source
  if (-not $node) { throw "Node.js not found" }
  if (-not (Test-Path $ServerJs)) { throw "server.js not found" }

  $cmd = "`"$node`" `"$ServerJs`""
  $proc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c $cmd >> `"$LogFile`" 2>&1" `
    -WindowStyle Hidden `
    -WorkingDirectory $Root `
    -PassThru

  Save-Pid $proc.Id
  Start-Sleep -Seconds 2

  for ($i = 0; $i -lt 10; $i++) {
    $running, $pidNow = Test-Running
    if ($running) {
      Write-Host "[OK] STARTED PID=$pidNow PORT=$Port"
      Write-Host "PHONE_URL=$(Get-PhoneUrl)"
      return
    }
    Start-Sleep -Seconds 1
  }
  Write-Host "[WAIT] Starting..."
  Write-Host "PHONE_URL=$(Get-PhoneUrl)"
}

function Stop-MobileRelay {
  $running, $pidNow = Test-Running
  if (-not $running) {
    Write-Host "[STOP] NOT RUNNING"
    if (Test-Path $PidFile) { Remove-Item $PidFile -Force }
    return
  }
  try { Stop-Process -Id $pidNow -Force -ErrorAction SilentlyContinue } catch {}
  if (Test-Path $PidFile) { Remove-Item $PidFile -Force }
  Write-Host "[STOP] STOPPED PID=$pidNow"
}

function Show-Status {
  $running, $pidNow = Test-Running
  if ($running) {
    Write-Host "[OK] RUNNING"
    Write-Host "PID=$pidNow"
    Write-Host "PORT=$Port"
    Write-Host "PHONE_URL=$(Get-PhoneUrl)"
    Write-Host "LANG=zh-CN"
  } else {
    Write-Host "[FAIL] NOT RUNNING"
    Write-Host "TIP=Double-click StartMobileCursor on desktop"
  }
}

switch ($Action) {
  "start" { Start-MobileRelay }
  "stop" { Stop-MobileRelay }
  "restart" { Stop-MobileRelay; Start-Sleep 1; Start-MobileRelay }
  default { Show-Status }
}
