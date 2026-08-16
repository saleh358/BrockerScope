param(
    [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$statusUrl = 'http://localhost:5056/api/session/status'
$stopScript = Join-Path $root 'Stop-BrokerScope.ps1'
$watchStarted = Get-Date

while ($true) {
    try {
        $status = Invoke-RestMethod -Uri $statusUrl -Method Get -TimeoutSec 5
        $lastHeartbeat = if ($status.lastHeartbeatUtc) { [DateTimeOffset]$status.lastHeartbeatUtc } else { $null }
    } catch {
        $lastHeartbeat = $null
    }

    $idleSeconds = if ($lastHeartbeat) {
        ((Get-Date).ToUniversalTime() - $lastHeartbeat.UtcDateTime).TotalSeconds
    } else {
        ((Get-Date) - $watchStarted).TotalSeconds
    }

    if ($idleSeconds -ge $TimeoutSeconds) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $stopScript -Silent
        break
    }

    Start-Sleep -Seconds 15
}
