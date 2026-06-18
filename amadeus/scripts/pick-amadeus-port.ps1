param(
  [int[]]$Candidates = @(3001, 3000, 3002, 3010)
)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$readyScript = Join-Path $scriptDir 'amadeus-ready.ps1'

function Test-PortListening([int]$Port) {
  try {
    $c = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return $null -ne $c
  } catch {
    $out = netstat -ano | Select-String ":$Port\s"
    return $null -ne $out
  }
}

foreach ($p in $Candidates) {
  $base = "http://127.0.0.1:$p"
  & $readyScript -Base $base | Out-Null
  if ($LASTEXITCODE -eq 0) {
    Write-Output $p
    exit 0
  }
}

foreach ($p in $Candidates) {
  if (-not (Test-PortListening -Port $p)) {
    Write-Output $p
    exit 0
  }
}

Write-Output 3001
exit 0
