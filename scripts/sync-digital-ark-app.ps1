# 从本地数字方舟同步 public → digitalark/app + assets/digitalark-app（含路径修复与 iframe 嵌入）
$script = Join-Path $PSScriptRoot "sync-digital-ark-portfolio.py"
if (-not (Test-Path $script)) { Write-Error "找不到: $script"; exit 1 }
python $script
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "已同步作品集用 App UI（含 portfolio-embed）"
