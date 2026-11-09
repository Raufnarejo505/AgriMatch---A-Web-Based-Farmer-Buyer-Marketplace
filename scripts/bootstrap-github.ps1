<#
.SYNOPSIS
    Creates the labels, sprint milestones and backlog issues for the AgriMatch
    team workflow, using the GitHub CLI.

.DESCRIPTION
    Reads ./issues.json (next to this script) and creates:

      * 20 labels  (type/*, area/*, size/*, P0..P2, process labels)
      * 3 milestones (Sprint 1/2/3, due 7/14/21 days from today)
      * 25 issues   (fully written bodies, labels, assignee, milestone)

    Idempotent: existing labels are updated, existing milestones and issues are
    skipped. Safe to re-run after editing issues.json.

.PARAMETER DryRun
    Print what would be created, touch nothing.

.PARAMETER Force
    Re-create issues even if a title already exists (you probably do not want
    this - it duplicates).

.EXAMPLE
    pwsh ./scripts/bootstrap-github.ps1 -DryRun

.EXAMPLE
    pwsh ./scripts/bootstrap-github.ps1
#>
[CmdletBinding()]
param(
    [string]$Repo = "Raufnarejo505/AgriMatch---A-Web-Based-Farmer-Buyer-Marketplace",
    [switch]$DryRun,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$here     = Split-Path -Parent $MyInvocation.MyCommand.Path
$dataPath = Join-Path $here "issues.json"

function Write-Step { param([string]$Text) Write-Host ""; Write-Host "== $Text" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Text) Write-Host "  ok   $Text" -ForegroundColor Green }
function Write-Skip { param([string]$Text) Write-Host "  skip $Text" -ForegroundColor DarkGray }
function Write-Warn2{ param([string]$Text) Write-Host "  warn $Text" -ForegroundColor Yellow }
function Write-Dry  { param([string]$Text) Write-Host "  DRY  $Text" -ForegroundColor Magenta }

# ---------------------------------------------------------------- preflight --
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "gh (GitHub CLI) is not installed." -ForegroundColor Red
    Write-Host "  winget install --id GitHub.cli"
    Write-Host "  gh auth login"
    exit 1
}

if (-not (Test-Path $dataPath)) {
    Write-Host "Missing data file: $dataPath" -ForegroundColor Red
    exit 1
}

& gh auth status --hostname github.com 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "gh is not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

$data = Get-Content -Raw -Encoding UTF8 $dataPath | ConvertFrom-Json

Write-Host ""
Write-Host "AgriMatch backlog bootstrap" -ForegroundColor White
Write-Host "  repo : $Repo"
Write-Host "  data : $dataPath"
Write-Host "  mode : $(if ($DryRun) { 'DRY RUN (nothing will be created)' } else { 'LIVE' })"

# -------------------------------------------------------------------- labels --
Write-Step "Labels ($($data.labels.Count))"

$existingLabels = @()
try {
    $existingLabels = & gh label list -R $Repo --limit 200 --json name | ConvertFrom-Json |
        ForEach-Object { $_.name }
} catch {
    Write-Warn2 "could not list existing labels; continuing"
}

foreach ($label in $data.labels) {
    if ($DryRun) {
        Write-Dry "label $($label.name)  #$($label.color)"
        continue
    }
    & gh label create $label.name -R $Repo --color $label.color --description $label.description --force 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        if ($existingLabels -contains $label.name) { Write-Skip "label $($label.name) (updated)" }
        else { Write-Ok "label $($label.name)" }
    } else {
        Write-Warn2 "failed to create label $($label.name)"
    }
}

# ---------------------------------------------------------------- milestones --
Write-Step "Milestones ($($data.milestones.Count))"

$existingMilestones = @()
try {
    $existingMilestones = & gh api "repos/$Repo/milestones?state=all&per_page=100" 2>$null |
        ConvertFrom-Json | ForEach-Object { $_.title }
} catch {
    Write-Warn2 "could not list existing milestones; continuing"
}

foreach ($ms in $data.milestones) {
    $due = (Get-Date).ToUniversalTime().Date.AddDays([int]$ms.due_in_days).AddHours(17).ToString("yyyy-MM-ddTHH:mm:ssZ")

    if ($existingMilestones -contains $ms.title) {
        Write-Skip "milestone $($ms.title)"
        continue
    }
    if ($DryRun) {
        Write-Dry "milestone $($ms.title)  due $due"
        continue
    }
    & gh api "repos/$Repo/milestones" -X POST `
        -f "title=$($ms.title)" `
        -f "description=$($ms.description)" `
        -f "due_on=$due" 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) { Write-Ok "milestone $($ms.title) (due $due)" }
    else { Write-Warn2 "failed to create milestone $($ms.title)" }
}

# -------------------------------------------------------------------- issues --
Write-Step "Issues ($($data.issues.Count))"

$existingIssues = @{}
try {
    $rows = & gh issue list -R $Repo --state all --limit 400 --json number,title | ConvertFrom-Json
    foreach ($r in $rows) { $existingIssues[$r.title] = $r.number }
} catch {
    Write-Warn2 "could not list existing issues; every issue will be created"
}

# Write the body to a temp file rather than passing it as an argument.
# PowerShell 5.1 mangles embedded double quotes when forwarding to a native exe,
# and our bodies are full of them.
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) "agrimatch-issue-$([guid]::NewGuid()).md"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$map = [ordered]@{}

foreach ($issue in $data.issues) {

    if ($existingIssues.ContainsKey($issue.title) -and -not $Force) {
        Write-Skip "$($issue.id) already exists as #$($existingIssues[$issue.title])"
        $map[$issue.id] = $existingIssues[$issue.title]
        continue
    }

    if ($DryRun) {
        Write-Dry "$($issue.id)  $($issue.title)"
        Write-Host "        labels: $($issue.labels -join ', ')"
        Write-Host "        assign: $($issue.assignees -join ', ')  milestone: $($issue.milestone)"
        continue
    }

    try {
        [System.IO.File]::WriteAllText($tmp, [string]$issue.body, $utf8NoBom)
    } catch {
        Set-Content -Path $tmp -Value ([string]$issue.body) -Encoding UTF8
    }

    # Not $args: that is a PowerShell automatic variable, and splatting it is a trap.
    $ghArgs = @(
        "issue", "create",
        "--repo", $Repo,
        "--title", $issue.title,
        "--body-file", $tmp,
        "--milestone", $issue.milestone
    )
    foreach ($l in $issue.labels)      { $ghArgs += @("--label", $l) }
    foreach ($a in $issue.assignees)   { $ghArgs += @("--assignee", $a) }

    $output = & gh @ghArgs 2>&1
    if ($LASTEXITCODE -eq 0) {
        $url   = ($output | Select-Object -Last 1).ToString().Trim()
        $num   = 0
        if ($url -match '/(\d+)$') { $num = [int]$Matches[1] }
        $map[$issue.id] = $num
        Write-Ok "$($issue.id) -> #$num  $($issue.title)"
    } else {
        Write-Warn2 "failed: $($issue.id) $($issue.title)"
        Write-Host "        $output" -ForegroundColor DarkYellow
    }
}

if (-not $DryRun -and (Test-Path $tmp)) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }

# ------------------------------------------------------------------- summary --
Write-Step "ID -> issue number map"

if ($DryRun) {
    Write-Host "  (dry run - nothing was created)"
} elseif ($map.Count -eq 0) {
    Write-Host "  (no issues created)"
} else {
    $map.GetEnumerator() |
        Sort-Object { [int]($_.Key -replace '[A-Z]', '') } |
        ForEach-Object { "  {0,-3} #{1}" -f $_.Key, $_.Value } |
        Write-Host

    $mapPath = Join-Path $here "issue-map.json"
    $map | ConvertTo-Json | Set-Content -Path $mapPath -Encoding UTF8
    Write-Host ""
    Write-Host "  Saved to $mapPath" -ForegroundColor DarkGray
    Write-Host "  Use these numbers in branch names: feat/12-refresh-tokens" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Next: open the Project board (docs/GITHUB_SETUP.md step 6) and link the issues." -ForegroundColor Cyan
Write-Host ""
