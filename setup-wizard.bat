@echo off
setlocal enabledelayedexpansion

:: ============================================================
::  BDO Combat Logger - Setup Wizard (Final Version)
:: ============================================================

title BDO Combat Logger - Setup Wizard
color 0B

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
set "DEBUG_LOG=%SCRIPT_DIR%\setup-debug.log"
echo. > "%DEBUG_LOG%"

cls

:menu
echo.
echo ============================================================
echo    BDO Combat Logger - Setup Wizard
echo ============================================================
echo.
echo What would you like to do?
echo.
echo    1. Check Prerequisites (Recommended First Step)
echo    2. Download Npcap Installer
echo    3. Build Application
echo    4. Create Installer (App Already Built)
echo    5. Clean Build (Remove all build files)
echo    6. Exit
echo.
echo ============================================================
echo.

set /p "CHOICE=Enter your choice (1-6): "

if "%CHOICE%"=="1" goto check_prereq
if "%CHOICE%"=="2" goto download_npcap
if "%CHOICE%"=="3" goto build_app_only
if "%CHOICE%"=="4" goto build_installer_only
if "%CHOICE%"=="5" goto clean_build
if "%CHOICE%"=="6" goto exit_script

echo Invalid choice. Please try again.
timeout /t 2 >nul
cls
goto menu

:: ------------------------------------------------------------
:check_prereq
cls
echo.
echo Running prerequisites check...
echo.
call "%SCRIPT_DIR%check-prerequisites.bat"
echo.
pause
cls
goto menu

:: ------------------------------------------------------------
:download_npcap
cls
echo.
echo Downloading Npcap installer...
echo.
call "%SCRIPT_DIR%download-npcap.bat"
echo.
pause
cls
goto menu

:: ------------------------------------------------------------
:build_app_only
cls
echo.
echo ============================================================
echo    Building Application Only (no installer)
echo ============================================================
echo.

cd /d "%SCRIPT_DIR%"

:: Step 1: Build logger
echo [1/3] Building Python logger...
cd logger
if not exist "install.bat" (
    echo [ERROR] logger\install.bat not found!
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)

call install.bat
if errorlevel 1 (
    echo [ERROR] Failed to build logger.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)
cd /d "%SCRIPT_DIR%"

:: Step 2: Install frontend/Electron dependencies
echo [2/3] Installing dependencies...
cd client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)

:: Step 3: Build the Electron app (unpacked, no installer)
echo [3/3] Building Electron app...
call npm run build:unpack
if errorlevel 1 (
    echo [ERROR] Failed to build the app.
    cd /d "%SCRIPT_DIR%"
    pause
    cls
    goto menu
)
cd /d "%SCRIPT_DIR%"

echo.
echo ============================================================
echo Application built successfully!
echo ============================================================
echo Location: client\dist\win-unpacked\
pause
cls
goto menu

:: ------------------------------------------------------------
:build_installer_only
cls
echo.
echo ============================================================
echo    Creating Installer (App Already Built)
echo ============================================================
echo.

cd /d "%SCRIPT_DIR%"

rem === Verify the app has been built at least once ===
if not exist "client\out\main\index.js" (
    echo [ERROR] Application not built yet! Run option 3 first.
    pause
    cls
    goto menu
)

rem === Verify Npcap ===
if not exist "dependencies\npcap-1.87.exe" (
    echo [ERROR] Missing dependencies\npcap-1.87.exe
    pause
    cls
    goto menu
)

echo Packaging installer...
cd client
call npm run package:win >> "%DEBUG_LOG%" 2>&1
set "PACKAGE_RESULT=%ERRORLEVEL%"
cd /d "%SCRIPT_DIR%"

echo Exit code: %PACKAGE_RESULT% >> "%DEBUG_LOG%"
if not "%PACKAGE_RESULT%"=="0" (
    echo Installer build failed! See %DEBUG_LOG%
) else (
    echo Installer built successfully!
    echo Location: client\dist\
)
pause
cls
goto menu

:: ------------------------------------------------------------
:clean_build
cls
echo.
echo ============================================================
echo    Clean Build
echo ============================================================
echo.
echo This will remove:
echo   - dist folder
echo   - logger build files
echo   - client build files
echo   - node_modules (optional)
set /p "CONFIRM=Are you sure? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Cancelled.
    timeout /t 2 >nul
    cls
    goto menu
)

cd /d "%SCRIPT_DIR%"
echo.
echo Cleaning build files...

if exist "dist" rmdir /s /q dist
if exist "logger\dist" rmdir /s /q logger\dist
if exist "logger\build" rmdir /s /q logger\build
if exist "client\out" rmdir /s /q client\out
if exist "client\dist" rmdir /s /q client\dist

set /p "CLEAN_NODE=Remove node_modules? (Y/N): "
if /i "%CLEAN_NODE%"=="Y" (
    if exist "client\node_modules" rmdir /s /q client\node_modules
    if exist "node_modules" rmdir /s /q node_modules
)

echo.
echo ============================================================
echo Clean complete!
echo ============================================================
pause
cls
goto menu

:: ------------------------------------------------------------
:exit_script
cls
echo.
echo Thank you for using BDO Combat Logger Setup Wizard!
echo.
timeout /t 2 >nul
exit /b 0
