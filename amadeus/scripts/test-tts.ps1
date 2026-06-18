param([string]$Base = 'http://127.0.0.1:3001')
$body = @{
  text = 'テストです'
  refer_wav_path = 'ref.wav'
  prompt_text = 'test'
} | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Uri "$Base/tts" -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing -TimeoutSec 30
  Write-Host "OK $($r.StatusCode) len=$($r.RawContentLength)"
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $txt = $reader.ReadToEnd()
    Write-Host "FAIL $($resp.StatusCode.value__) $txt"
  } else {
    Write-Host "FAIL $($_.Exception.Message)"
  }
}
