[CmdletBinding()]
param(
  [switch]$Universal,
  [switch]$ResetNative
)

$ErrorActionPreference = 'Stop'
$timer = [System.Diagnostics.Stopwatch]::StartNew()
$sourceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$buildRoot = 'C:\c4j'
$gradleHome = 'C:\g'
$desktopArtifacts = 'C:\Users\millo\Desktop\Clean4Jesus\artifacts\apk'
$currentDir = Join-Path $desktopArtifacts 'current'
$previousDir = Join-Path $desktopArtifacts 'previous'
$currentApk = Join-Path $currentDir 'Clean4Jesus-current.apk'
$previousApk = Join-Path $previousDir 'Clean4Jesus-previous.apk'
$metaPath = Join-Path $buildRoot '.c4j-build-meta.json'
$requiredRemote = 'https://github.com/adminclean4jesus-lang/clean4jesus.git'

function Stop-Build([string]$message) {
  throw "APK local: $message"
}

function Get-Sha256([string]$path) {
  # Some managed PowerShell hosts omit Get-FileHash. Keep the build launcher
  # self-contained so metadata and delivery verification work everywhere.
  $stream = [System.IO.File]::OpenRead($path)
  try {
    $bytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($stream)
    return ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
  }
  finally {
    $stream.Dispose()
  }
}

function Get-Jdk17 {
  $candidates = @(
    $env:JAVA_HOME,
    'C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot',
    'C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot',
    'C:\Program Files\Java\jdk-17'
  ) | Where-Object { $_ -and (Test-Path (Join-Path $_ 'bin\java.exe')) }
  foreach ($candidate in $candidates) {
    # `java -version` writes its normal version banner to stderr. With the
    # launcher running under `$ErrorActionPreference = Stop`, invoking it here
    # can falsely abort the APK build before Gradle even starts. The JDK release
    # file is deterministic and has no stderr side effect.
    $releaseFile = Join-Path $candidate 'release'
    $version = if (Test-Path $releaseFile) { Get-Content -LiteralPath $releaseFile -Raw } else { '' }
    if ($version -match 'JAVA_VERSION="17\.') { return $candidate }
  }
  Stop-Build 'no encontré un JDK 17. Instala JDK 17 o define JAVA_HOME.'
}

function Get-AndroidSdk {
  $candidates = @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, 'C:\Users\millo\AppData\Local\Android\Sdk') |
    Where-Object { $_ -and (Test-Path (Join-Path $_ 'platform-tools')) }
  if ($candidates.Count -eq 0) { Stop-Build 'no encontré Android SDK.' }
  return (Resolve-Path $candidates[0]).Path
}

function Get-NdkVersion {
  # Expo projects do not always pin ndkVersion in android/build.gradle. Fall
  # back to the React Native version catalog that Gradle itself uses.
  $versionFiles = @(
    (Join-Path $sourceRoot 'android\build.gradle'),
    (Join-Path $sourceRoot 'node_modules\react-native\gradle\libs.versions.toml')
  )
  foreach ($versionFile in $versionFiles) {
    if (-not (Test-Path $versionFile)) { continue }
    $match = Select-String -LiteralPath $versionFile -Pattern 'ndkVersion\s*=\s*["'']([^"'']+)' | Select-Object -First 1
    if ($match -and $match.Matches.Count -gt 0) {
      $version = $match.Matches[0].Groups[1].Value
      if ($version) { return $version }
    }
  }
  Stop-Build 'no pude determinar la versión de NDK desde Android o React Native.'
}

function Sync-Source {
  $excludedDirectories = @(
    (Join-Path $sourceRoot '.git'),
    (Join-Path $sourceRoot 'node_modules'),
    (Join-Path $sourceRoot 'android\.gradle'),
    (Join-Path $sourceRoot 'android\.gradle-user-home'),
    (Join-Path $sourceRoot 'android\build'),
    (Join-Path $sourceRoot 'android\app\build'),
    (Join-Path $sourceRoot '.gradle-local'),
    (Join-Path $sourceRoot 'artifacts'),
    (Join-Path $sourceRoot 'tmp'),
    (Join-Path $sourceRoot 'web\landing')
  )
  New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null
  # Keep the persistent Gradle/CMake worktree intact. `/MIR` treats excluded
  # destination caches as extras and spends minutes deleting them, defeating
  # the local-build cache policy. Incremental copy updates source files only.
  & robocopy $sourceRoot $buildRoot /E /XO /FFT /R:2 /W:1 /NFL /NDL /NJH /NJS /NP /XD $excludedDirectories | Out-Null
  if ($LASTEXITCODE -gt 7) { Stop-Build "la sincronización a $buildRoot falló (robocopy $LASTEXITCODE)." }
}

function Assert-GitHubSource {
  Push-Location $sourceRoot
  try {
    $remote = (& git remote get-url origin 2>$null).Trim()
    if (-not $remote -or $remote.TrimEnd('/') -ne $requiredRemote.TrimEnd('/')) {
      Stop-Build "el remoto origin debe ser GitHub ($requiredRemote); detectado: '$remote'."
    }
  }
  finally { Pop-Location }
}

function Ensure-Dependencies([string]$lockHash) {
  $needsInstall = -not (Test-Path (Join-Path $buildRoot 'node_modules'))
  $installedLock = Join-Path $buildRoot 'node_modules\.package-lock.json'
  if (Test-Path $metaPath) {
    $meta = Get-Content $metaPath -Raw | ConvertFrom-Json
    $needsInstall = $needsInstall -or ($meta.lockHash -ne $lockHash)
  } elseif (Test-Path $installedLock) {
    # An interrupted shell can leave the metadata write behind even after
    # `npm ci` has completed. npm's own installed lock is sufficient to reuse
    # that verified dependency tree once and recreate our lightweight marker.
    $needsInstall = $false
  }
  if ($needsInstall) {
    Write-Host 'Instalando dependencias porque node_modules no existe o cambió package-lock.json...' -ForegroundColor Yellow
    Push-Location $buildRoot
    try { & npm.cmd ci --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { Stop-Build 'npm ci falló.' } }
    finally { Pop-Location }
  } else {
    Write-Host 'node_modules reutilizado; package-lock.json sin cambios.' -ForegroundColor DarkGreen
  }
  @{ lockHash = $lockHash; sourceRoot = $sourceRoot; buildRoot = $buildRoot; updatedAt = (Get-Date).ToUniversalTime().ToString('o') } |
    ConvertTo-Json | Set-Content -LiteralPath $metaPath -Encoding UTF8
}

function Ensure-AndroidLocalConfig([string]$sdk, [string]$ndk) {
  $androidDir = Join-Path $buildRoot 'android'
  $sdkForGradle = $sdk.Replace('\', '/')
  $ndkForGradle = $ndk.Replace('\', '/')
  "sdk.dir=$sdkForGradle`nndk.dir=$ndkForGradle`n" |
    Set-Content -LiteralPath (Join-Path $androidDir 'local.properties') -Encoding ASCII
  $keystore = Join-Path $androidDir 'debug.keystore'
  if (-not (Test-Path $keystore)) {
    $keytool = Join-Path $env:JAVA_HOME 'bin\keytool.exe'
    & $keytool -genkeypair -v -storetype PKCS12 -keystore $keystore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=Android Debug,O=Android,C=US' | Out-Null
    if ($LASTEXITCODE -ne 0) { Stop-Build 'no pude crear el debug.keystore local.' }
  }
}

function Reset-NativeCaches {
  $targets = @(
    (Join-Path $buildRoot 'android\.cxx'),
    (Join-Path $buildRoot 'android\app\.cxx'),
    (Join-Path $buildRoot 'android\build'),
    (Join-Path $buildRoot 'android\app\build')
  )
  foreach ($target in $targets) { if (Test-Path $target) { Remove-Item -LiteralPath $target -Recurse -Force } }
}

function Publish-Apk([string]$apkPath) {
  if (-not (Test-Path $apkPath)) { Stop-Build "Gradle terminó, pero no existe $apkPath." }
  New-Item -ItemType Directory -Force -Path $currentDir, $previousDir | Out-Null
  if (Test-Path $previousApk) { Remove-Item -LiteralPath $previousApk -Force }
  if (Test-Path $currentApk) { Move-Item -LiteralPath $currentApk -Destination $previousApk -Force }
  Copy-Item -LiteralPath $apkPath -Destination $currentApk -Force
  Get-ChildItem -LiteralPath $desktopArtifacts -Filter '*.apk' -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notin @($currentApk, $previousApk) } |
    Remove-Item -Force
  $hash = Get-Sha256 $currentApk
  $size = (Get-Item -LiteralPath $currentApk).Length
  Write-Host "APK: $currentApk" -ForegroundColor Green
  Write-Host "Tamaño: $size bytes" -ForegroundColor Green
  Write-Host "SHA-256: $hash" -ForegroundColor Green
}

$env:CLEAN4JESUS_PLATFORM = 'android'
$env:NODE_ENV = 'production'
$jdk = Get-Jdk17
$env:JAVA_HOME = $jdk
$env:PATH = "$(Join-Path $jdk 'bin');$env:PATH"
$sdk = Get-AndroidSdk
$env:GRADLE_USER_HOME = $gradleHome
$env:JAVA_TOOL_OPTIONS = '-Duser.home=C:\c4j\.user-home'
$env:ANDROID_USER_HOME = $null
$env:ANDROID_SDK_HOME = $null
$env:ANDROID_AVD_HOME = $null
$ndkVersion = Get-NdkVersion
$ndk = Join-Path $sdk "ndk\$ndkVersion"
if (-not (Test-Path $ndk)) { Stop-Build "no encontré NDK $ndkVersion en $ndk." }

Assert-GitHubSource
$lockHash = Get-Sha256 (Join-Path $sourceRoot 'package-lock.json')
Sync-Source
Ensure-Dependencies $lockHash
Ensure-AndroidLocalConfig $sdk $ndk
if ($ResetNative) { Write-Host 'ResetNative solicitado: limpiando solo caches nativas de C:\c4j.' -ForegroundColor Yellow; Reset-NativeCaches }

$architectures = if ($Universal) { 'armeabi-v7a,arm64-v8a,x86,x86_64' } else { 'arm64-v8a' }
$gradleDir = Join-Path $buildRoot 'android'
Push-Location $gradleDir
try {
  & .\gradlew.bat ':app:assembleDebug' "-PreactNativeArchitectures=$architectures" '--no-daemon' '--max-workers=1' '--console=plain'
  if ($LASTEXITCODE -ne 0) { Stop-Build "Gradle falló con código $LASTEXITCODE. Usa -ResetNative solo si el error es CMake/Ninja." }
}
finally { Pop-Location }

Publish-Apk (Join-Path $gradleDir 'app\build\outputs\apk\debug\app-debug.apk')
$timer.Stop()
Write-Host "Tiempo total: $([math]::Round($timer.Elapsed.TotalMinutes, 2)) minutos" -ForegroundColor Cyan
Write-Host 'Para levantar el QR: npm run dev-client' -ForegroundColor Cyan
