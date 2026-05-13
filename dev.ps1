# dev.ps1 — start API + web frontend together
# Run from the cobol-archaeologist-web repo root.
# Pre-requisites (once):
#   cd ..\cobol-archaeologist ; pip install -e ".[api,rag]"
#   npm install  (in this directory)
#   ollama pull qwen2.5-coder:1.5b

$webDir  = $PSScriptRoot
$apiDir  = "$PSScriptRoot\..\cobol-archaeologist"

if (-not (Test-Path $apiDir)) {
    Write-Error "Backend repo not found at '$apiDir'. Clone it there first."
    exit 1
}

$api = Start-Process powershell `
    -ArgumentList "-NoExit", "-Command",
        "cd '$apiDir'; uvicorn cobol_archaeologist.api.main:app --reload --port 8000" `
    -PassThru

Write-Host "API started (PID $($api.Id)) -> http://localhost:8000"

$web = Start-Process powershell `
    -ArgumentList "-NoExit", "-Command",
        "cd '$webDir'; npm run dev" `
    -PassThru

Write-Host "Web started (PID $($web.Id)) -> http://localhost:3000"
Write-Host "Close the two new windows (or Ctrl+C in each) to stop."
