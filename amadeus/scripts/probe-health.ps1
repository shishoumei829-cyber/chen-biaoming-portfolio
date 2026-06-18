param([string]$Base = 'http://127.0.0.1:3001')
try {
  $r = Invoke-WebRequest -Uri "$Base/health" -UseBasicParsing -TimeoutSec 5
  Write-Host "health OK $($r.StatusCode)"
  Write-Host $r.Content.Substring(0, [Math]::Min(200, $r.Content.Length))
} catch {
  Write-Host "health FAIL $($_.Exception.Message)"
}
try {
  $r2 = Invoke-WebRequest -Uri "$Base/amadeus_work.html" -UseBasicParsing -TimeoutSec 5
  Write-Host "html OK $($r2.StatusCode) len=$($r2.Content.Length)"
} catch {
  Write-Host "html FAIL $($_.Exception.Message)"
}
