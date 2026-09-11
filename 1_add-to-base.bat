@echo off
cd /d "%~dp0"
echo [1/2] Updating the image list...
node build-data.js
echo.
echo [2/2] Making CSV + zip for drawings not yet on BASE...
node base-csv.js
echo.
echo NEXT:
echo   1. GitHub Desktop: Commit, then Push origin
echo   2. BASE: CSV app - upload base_upload\new_items.csv and new_images.zip
echo   3. BASE: CSV app - download products CSV (check: ID, name)
echo   4. Run 2_link-base.bat
pause