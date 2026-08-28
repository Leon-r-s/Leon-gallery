@echo off
cd /d "%~dp0"
echo Updating the image list...
node build-data.js
echo.
echo Done. Now open GitHub Desktop and press Commit, then Push origin.
pause
