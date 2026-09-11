@echo off
cd /d "%~dp0"
echo Looking for the newest BASE CSV in your Downloads folder...
set "LATEST="
for /f "delims=" %%F in ('dir /b /o-d "%USERPROFILE%\Downloads\leolabo-base-shop-*.csv" 2^>nul') do (
  if not defined LATEST set "LATEST=%%F"
)
if not defined LATEST (
  echo Not found. Download the products CSV from BASE first, then run this again.
  pause
  exit /b 1
)
echo Using: %LATEST%
copy /y "%USERPROFILE%\Downloads\%LATEST%" "base_upload\base_export.csv" >nul
node base-link-csv.js base_upload/base_export.csv
echo.
echo NEXT: GitHub Desktop: Commit, then Push origin
pause