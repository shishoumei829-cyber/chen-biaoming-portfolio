# 配置开机自启 + 立即后台启动 Amadeus 悬浮窗（仅需运行一次）
param(
  [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$bat = Join-Path $PSScriptRoot 'start-float-tray.bat'
$startup = [Environment]::GetFolderPath('Startup')
$lnkPath = Join-Path $startup 'Amadeus Float.lnk'

if (-not (Test-Path $bat)) {
  Write-Error "Missing: $bat"
}

$wsh = New-Object -ComObject WScript.Shell
$s = $wsh.CreateShortcut($lnkPath)
$s.TargetPath = $bat
$s.WorkingDirectory = $ProjectRoot
$s.WindowStyle = 7
$s.Description = 'Amadeus float tray (Alt+Shift+K)'
$s.Save()

Write-Host "[OK] Startup shortcut: $lnkPath"
Write-Host "[.] Starting tray (hidden)..."
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = "/c `"$bat`""
$psi.WorkingDirectory = $ProjectRoot
$psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
$psi.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psi) | Out-Null

Start-Sleep -Seconds 2
Write-Host ""
Write-Host "[OK] Done. Press Alt+Shift+K to open/close the float window."
Write-Host "     Tray icon should appear near the clock."
