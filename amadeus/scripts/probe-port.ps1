param([int]$Port = 3000)
$urls = @(
  "http://127.0.0.1:$Port/",
  "http://127.0.0.1:$Port/health",
  "http://127.0.0.1:$Port/amadeus_work.html"
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 5
    Write-Host "$u -> $($r.StatusCode) len=$($r.Content.Length)"
    if ($r.Content.Length -lt 300) { Write-Host $r.Content }
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "$u -> ERR $code $($_.Exception.Message)"
  }
}
