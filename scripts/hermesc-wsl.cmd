@echo off
setlocal
C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File C:\Users\millo\Desktop\Clean4Jesus\scripts\hermesc-wsl.ps1 %*
exit /b %ERRORLEVEL%
