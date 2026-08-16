$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiProject = Join-Path $root 'service-bus-inspector\src\BrokerScope.Api'
$dashboard = Join-Path $root 'service-bus-inspector-dashboard'

function Show-LauncherError([string]$message) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show($message, 'BrokerScope startup error', 'OK', 'Error') | Out-Null
    exit 1
}

if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Show-LauncherError 'The .NET 8 SDK was not found. Install it, then run this launcher again.'
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Show-LauncherError 'Node.js/npm was not found. Install Node.js 22+, then run this launcher again.'
}

if (-not (Test-Path (Join-Path $apiProject 'BrokerScope.Api.csproj'))) {
    Show-LauncherError "The API project was not found at:`n$apiProject"
}

if (-not (Test-Path (Join-Path $dashboard 'node_modules'))) {
    Show-LauncherError "Frontend dependencies are missing. Open a terminal in:`n$dashboard`nand run: npm install"
}

$apiCommand = "Set-Location -LiteralPath '$apiProject'; dotnet run"
$frontendCommand = "Set-Location -LiteralPath '$dashboard'; npm run dev"

Start-Process powershell.exe -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', $apiCommand
) -WindowStyle Hidden -WorkingDirectory $apiProject | Out-Null

Start-Sleep -Seconds 2

Start-Process powershell.exe -ArgumentList @(
    '-NoExit',
    '-ExecutionPolicy', 'Bypass',
    '-Command', $frontendCommand
) -WindowStyle Hidden -WorkingDirectory $dashboard | Out-Null

Start-Sleep -Seconds 3
Start-Process 'http://127.0.0.1:5173' | Out-Null

$watcher = Join-Path $root 'Watch-BrokerScope.ps1'
Start-Process powershell.exe -ArgumentList @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', $watcher,
    '-TimeoutSeconds', '60'
) -WindowStyle Hidden -WorkingDirectory $root | Out-Null
