$ErrorActionPreference = "Stop"
$agentRoot = Join-Path $env:LOCALAPPDATA "cursor-agent"
$files = @(
  (Join-Path $agentRoot "agent.ps1"),
  (Join-Path $agentRoot "cursor-agent.ps1")
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) { continue }
  $content = Get-Content $file -Raw
  $fixed = $content -replace "\^\d\{4\}\\.\d\{1,2\}\\.\d\{1,2\}-\[a-f0-9\]\+\$", "^\d{4}\.\d{1,2}\.\d{1,2}-.+$"
  if ($fixed -ne $content) {
    Set-Content $file $fixed -NoNewline
    Write-Host "FIXED $file"
  }
}
