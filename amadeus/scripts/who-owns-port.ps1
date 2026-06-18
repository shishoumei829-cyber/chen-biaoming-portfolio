param([int]$Port = 3000)
$line = netstat -ano | Select-String ":\s*$Port\s" | Select-String 'LISTENING' | Select-Object -First 1
if (-not $line) { Write-Host "Port $Port is free"; exit 0 }
$m = [regex]::Match($line.Line, '\s+(\d+)\s*$')
$ownerPid = $m.Groups[1].Value
Write-Host "Port $Port -> PID $ownerPid"
Get-CimInstance Win32_Process -Filter "ProcessId=$ownerPid" | ForEach-Object { Write-Host $_.CommandLine }
