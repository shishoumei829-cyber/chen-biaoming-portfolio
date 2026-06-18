param(
  [string]$Base = 'http://127.0.0.1:3001'
)
try {
  $r = Invoke-WebRequest -Uri "$Base/health" -UseBasicParsing -TimeoutSec 4
  if ($r.StatusCode -ne 200) { exit 1 }
  $j = $r.Content | ConvertFrom-Json
  if ($null -ne $j.ready -and $j.checks) { exit 0 }
  if ($j.ok -eq $true) { exit 0 }
  exit 1
} catch {
  exit 1
}
