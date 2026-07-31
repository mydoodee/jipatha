@echo off
echo ========================================================
echo   Jipatha (Shopee Affiliate 2026) Auto Build & Deploy
echo ========================================================
echo.

echo [1/2] Building Next.js Application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Deploying to Firebase (Project: jipatha-798)...
call npx firebase deploy

echo.
echo ========================================================
echo   SUCCESS! Deployment complete.
echo ========================================================
pause
