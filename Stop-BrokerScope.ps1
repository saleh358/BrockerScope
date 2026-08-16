param(
    [switch]$Silent
)

$ErrorActionPreference = 'SilentlyContinue'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootPattern = [Regex]::Escape($root)

Get-CimInstance Win32_Process |
    Where-Object {
        $_.ProcessId -ne $PID -and
        $_.CommandLine -and
        $_.CommandLine -match $rootPattern -and
        ($_.Name -in @('powershell.exe', 'pwsh.exe', 'dotnet.exe', 'node.exe'))
    } |
    ForEach-Object {
        & taskkill.exe /PID $_.ProcessId /T /F | Out-Null
    }

if (-not $Silent) {
    Add-Type -AssemblyName PresentationFramework
    [System.Windows.MessageBox]::Show('BrokerScope background services stopped.', 'BrokerScope') | Out-Null
}
