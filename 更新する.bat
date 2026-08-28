@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo 絵のリストを、最新の状態に作り直しています...
node build-data.js
echo.
echo 出来ました。このあと、GitHub Desktopを開いて
echo 「Commit」→「Push origin」を押せば、サイトに反映されます。
pause
