$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Manager = Join-Path $Root "service-manager.ps1"
$StartupDir = [Environment]::GetFolderPath("Startup")
$DesktopDir = [Environment]::GetFolderPath("Desktop")
$Wsh = New-Object -ComObject WScript.Shell

function New-Shortcut([string]$Path, [string]$Target, [string]$Args) {
  $s = $Wsh.CreateShortcut($Path)
  $s.TargetPath = $Target
  if ($Args) { $s.Arguments = $Args }
  $s.WorkingDirectory = $Root
  $s.Save()
}

New-Shortcut (Join-Path $StartupDir "CursorMobileAutoStart.lnk") "powershell.exe" "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Manager`" -Action start"
New-Shortcut (Join-Path $DesktopDir "CheckMobileCursor.lnk") "powershell.exe" "-NoExit -ExecutionPolicy Bypass -File `"$Manager`" -Action status"
New-Shortcut (Join-Path $DesktopDir "StartMobileCursor.lnk") "powershell.exe" "-NoExit -ExecutionPolicy Bypass -File `"$Manager`" -Action start"
New-Shortcut (Join-Path $DesktopDir "StopMobileCursor.lnk") "powershell.exe" "-NoExit -ExecutionPolicy Bypass -File `"$Manager`" -Action stop"

$startOutput = & $Manager -Action start 2>&1 | Out-String
$m = [regex]::Match($startOutput, "PHONE_URL=(http[^\r\n]+)")
$url = if ($m.Success) { $m.Groups[1].Value } else { "http://100.78.141.64:4789/?token=shikimori-phone-cursor-2026" }

$urlFile = Join-Path $DesktopDir "手机打开Cursor.url"
"[InternetShortcut]`r`nURL=$url`r`n" | Set-Content -Path $urlFile -Encoding ASCII

Write-Host "SETUP_OK"
Write-Host "PHONE_URL=$url"
