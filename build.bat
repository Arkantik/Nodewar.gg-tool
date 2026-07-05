:: Build the Python logger
cd logger
CALL install.bat
cd ..

:: Install frontend/Electron dependencies and build the Windows installer
:: (electron-builder pulls logger/dist/logger.exe and dependencies/npcap-*.exe in automatically
:: via extraResources - no manual copying needed)
cd client
CALL npm install
CALL npm run build:win
cd ..

echo Build completed. Installer is in client\dist\
