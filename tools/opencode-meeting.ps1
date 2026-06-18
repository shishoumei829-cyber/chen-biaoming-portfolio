param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Topic,

  [string]$ProjectDir = (Get-Location).Path,
  [string[]]$Models = @("deepseek/deepseek-chat", "deepseek/deepseek-reasoner"),
  [int]$TimeoutSeconds = 900
)

$ErrorActionPreference = "Stop"

$OpenCode = Join-Path $env:LOCALAPPDATA "OpenCode\opencode-cli.exe"
if (-not (Test-Path -LiteralPath $OpenCode)) {
  throw "opencode-cli.exe not found at $OpenCode"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outDir = Join-Path $ProjectDir ".codex\meetings\$stamp"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$promptTemplate = @"
这是 Codex 拉起的方案会议。你是其中一个独立参会模型。
请围绕主题给出：
1. 你建议的方向。
2. 关键理由。
3. 最大风险。
4. 你会如何验证。
5. 不超过 5 条结论。

只做头脑风暴和审查，不修改文件。

主题：
{0}
"@

function Quote-Arg([string]$Value) {
  if ($null -eq $Value) { return '""' }
  return '"' + ($Value -replace '"', '\"') + '"'
}

foreach ($model in $Models) {
  $safe = ($model -replace "[^A-Za-z0-9_.-]", "_")
  $file = Join-Path $outDir "$safe.md"
  $prompt = [string]::Format($promptTemplate, $Topic)

  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $OpenCode
  $argsList = @("run", "-m", $model, "--dir", $ProjectDir, "--title", "codex-meeting-$safe", $prompt)
  $psi.Arguments = ($argsList | ForEach-Object { Quote-Arg $_ }) -join " "
  $psi.WorkingDirectory = $ProjectDir
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true

  $p = [System.Diagnostics.Process]::Start($psi)
  if (-not $p.WaitForExit($TimeoutSeconds * 1000)) {
    try { $p.Kill($true) } catch {}
    Set-Content -LiteralPath $file -Value "TIMEOUT: $model" -Encoding UTF8
    continue
  }

  $stdout = $p.StandardOutput.ReadToEnd()
  $stderr = $p.StandardError.ReadToEnd()
  $content = "# $model`r`n`r`n$stdout"
  if ($stderr) {
    $content += "`r`n`r`n## opencode logs`r`n$stderr"
  }
  Set-Content -LiteralPath $file -Value $content -Encoding UTF8
}

Write-Output "Meeting notes written to: $outDir"
