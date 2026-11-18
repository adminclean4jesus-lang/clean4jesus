$ErrorActionPreference = 'Stop'

$projectRoot = 'C:\Users\millo\Desktop\Clean4Jesus'
$wsl = 'C:\Windows\System32\wsl.exe'
$hermesc = '/mnt/c/Users/millo/Desktop/Clean4Jesus/node_modules/hermes-compiler/hermesc/linux64-bin/hermesc'

function Convert-ToWslPath([string]$windowsPath) {
  $absolute = [System.IO.Path]::GetFullPath($windowsPath)
  $drive = $absolute.Substring(0, 1).ToLowerInvariant()
  $suffix = $absolute.Substring(3).Replace('\', '/')
  return "/mnt/$drive/$suffix"
}

$converted = foreach ($argument in $args) {
  if ($argument.StartsWith('-')) {
    $argument
    continue
  }

  $windowsPath = if ([System.IO.Path]::IsPathRooted($argument)) {
    $argument
  } else {
    Join-Path $projectRoot $argument
  }

  if (Test-Path -LiteralPath $windowsPath -PathType Leaf) {
    Convert-ToWslPath $windowsPath
    continue
  }

  $parent = Split-Path -Parent $windowsPath
  if ($parent -and (Test-Path -LiteralPath $parent -PathType Container)) {
    $linuxParent = Convert-ToWslPath $parent
    "$linuxParent/$(Split-Path -Leaf $windowsPath)"
    continue
  }

  $argument
}

& $wsl -d Ubuntu -- $hermesc @converted
exit $LASTEXITCODE
