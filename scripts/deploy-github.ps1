$ErrorActionPreference = 'Stop'
$gh = 'C:\Program Files\GitHub CLI\gh.exe'
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

Write-Host 'Checking GitHub login...'
& $gh auth status | Out-Null

$repoName = 'chen-biaoming-portfolio'
Write-Host "Creating public repo: $repoName"
& $gh repo create $repoName --public --source=. --remote=origin --push --description '陈彪明工业设计作品集'

Write-Host 'Enabling GitHub Pages (GitHub Actions)...'
& $gh api -X PUT "repos/{owner}/$repoName/pages" -f build_type=workflow | Out-Null

$pagesUrl = (& $gh repo view $repoName --json url -q '.url' ) -replace 'github.com','github.io' + '/'
Write-Host "Done. Site will be live at: $pagesUrl"
Write-Host 'Wait 1-2 minutes for the deploy workflow to finish.'
