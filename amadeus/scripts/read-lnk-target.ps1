param([string]$LnkPath)
$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut($LnkPath)
Write-Host "Target=$($sc.TargetPath)"
Write-Host "Args=$($sc.Arguments)"
Write-Host "WorkDir=$($sc.WorkingDirectory)"
Write-Host "Exists=$(Test-Path -LiteralPath $sc.TargetPath)"
