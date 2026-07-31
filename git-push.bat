@echo off
chcp 65001 >nul
echo ========================================================
echo   Jipatha - Git Push to GitHub
echo ========================================================
echo.

set /p MSG="Commit message (Enter for auto): "
if "%MSG%"=="" set MSG=update: %date% %time%

git add .
git commit -m "%MSG%"
git push origin main

echo.
echo ========================================================
echo   SUCCESS! Code pushed to GitHub.
echo ========================================================
pause
