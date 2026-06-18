param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$Task,

  [string]$ProjectDir = (Get-Location).Path,
  [string]$Model = "deepseek/deepseek-chat",
  [string]$Title = "codex-delegate",
  [switch]$AllowEdits,
  [int]$TimeoutSeconds = 600
)

$ErrorActionPreference = "Stop"

$OpenCode = Join-Path $env:LOCALAPPDATA "OpenCode\opencode-cli.exe"
if (-not (Test-Path -LiteralPath $OpenCode)) {
  throw "opencode-cli.exe not found at $OpenCode"
}

if (-not (Test-Path -LiteralPath $ProjectDir)) {
  throw "ProjectDir does not exist: $ProjectDir"
}

$guard = @"
你是 Codex 委派给 opencode/DeepSeek 的执行代理。请严格遵守：
1. 只处理这次任务，不做无关重构。
2. 默认先读文件、定位问题、给出简短执行摘要。
3. 文件存在性与目录信息优先用终端命令确认，不要只依赖 Glob 索引。
4. 只有在任务明确需要修改，或 AllowEdits=true 时才改文件。
5. 修改前尽量小范围；不要删除用户现有改动；不要执行破坏性 git 命令。
6. 完成后列出改了哪些文件、如何验证、还有哪些风险。

AllowEdits=$($AllowEdits.IsPresent)
任务：
$Task
"@

$argsList = @(
  "run",
  "-m", $Model,
  "--dir", $ProjectDir,
  "--title", $Title
)

if ($AllowEdits.IsPresent) {
  $argsList += "--dangerously-skip-permissions"
}

$argsList += $guard

function Quote-Arg([string]$Value) {
  if ($null -eq $Value) { return '""' }
  return '"' + ($Value -replace '"', '\"') + '"'
}

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $OpenCode
$psi.Arguments = ($argsList | ForEach-Object { Quote-Arg $_ }) -join " "
$psi.WorkingDirectory = $ProjectDir
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true

$p = [System.Diagnostics.Process]::Start($psi)
if (-not $p.WaitForExit($TimeoutSeconds * 1000)) {
  try { $p.Kill($true) } catch {}
  throw "opencode delegate timed out after $TimeoutSeconds seconds"
}

$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()

if ($stdout) { Write-Output $stdout.TrimEnd() }
if ($stderr) {
  Write-Output ""
  Write-Output "## opencode logs"
  Write-Output $stderr.TrimEnd()
}
exit $p.ExitCode
