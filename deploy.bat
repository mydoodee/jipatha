@echo off
chcp 65001 >nul
echo ========================================================
echo   Jipatha - Shopee Affiliate 2026
echo   Auto Build and Deploy to Vercel (via GitHub Push)
echo ========================================================
echo.

echo [1/2] Building Next.js Application...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Pushing code to GitHub (Triggers Vercel Auto-Deploy)...
echo.
git add .
git commit -m "deploy to vercel: %date% %time%"
git push origin main

echo.
echo ========================================================
echo   SUCCESS! Pushed to GitHub.
echo   Vercel will build and deploy your site automatically!
echo ========================================================
pause
