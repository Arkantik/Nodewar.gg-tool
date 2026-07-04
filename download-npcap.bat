@echo off
:: Download Npcap installer to dependencies folder

title Download Npcap Installer

echo.
echo ============================================================
echo    Downloading Npcap Installer
echo ============================================================
echo.

:: Create dependencies folder if it doesn't exist
if not exist "dependencies" (
    mkdir dependencies
    echo Created dependencies folder
)

:: Check if already exists
if exist "dependencies\npcap-1.87.exe" (
    echo Npcap installer already exists at: dependencies\npcap-1.87.exe
    echo.
    set /p "OVERWRITE=Do you want to re-download? (Y/N): "
    if /i not "!OVERWRITE!"=="Y" (
        echo Keeping existing file
        goto :end
    )
    echo Removing old file...
    del "dependencies\npcap-1.87.exe"
)

echo.
echo Downloading Npcap 1.87 from npcap.com...
echo This may take a few moments...
echo.

:: Try to download using PowerShell
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://npcap.com/dist/npcap-1.87.exe' -OutFile 'dependencies\npcap-1.87.exe'; if ($?) {Write-Host '[SUCCESS] Downloaded successfully!' -ForegroundColor Green} else {Write-Host '[ERROR] Download failed!' -ForegroundColor Red; exit 1}}"

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to download Npcap installer
    echo.
    echo Please download manually from:
    echo https://npcap.com/dist/npcap-1.87.exe
    echo.
    echo Save it to: dependencies\npcap-1.84.exe
    goto :end
)

:: Verify the file was downloaded
if exist "dependencies\npcap-1.87.exe" (
    echo.
    echo [SUCCESS] Npcap installer downloaded successfully!
    echo Location: dependencies\npcap-1.87.exe
    echo.
    
    :: Get file size
    for %%A in ("dependencies\npcap-1.87.exe") do (
        echo File size: %%~zA bytes
    )
) else (
    echo.
    echo [ERROR] File not found after download
)

:end
echo.
echo Press any key to exit...
pause >nul