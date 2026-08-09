@echo off
chcp 65001 >nul
echo ========================================================
echo   Jipatha - Quick Vercel Deploy (Git Push)
echo ========================================================
echo.

echo Pushing updates to GitHub for Vercel deployment...
echo.
git add .
git commit -m "quick update for vercel: %date% %time%"
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git push failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   SUCCESS! Pushed to GitHub.
echo   Vercel deployment triggered automatically.
echo ========================================================
pause
