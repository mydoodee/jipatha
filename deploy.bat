@echo off
chcp 65001 >nul
echo ========================================================
echo   Jipatha - Shopee Affiliate 2026
echo   Auto Build and Deploy to Firebase Hosting
echo ========================================================
echo.

echo [1/3] Building Next.js Application...
echo.
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed! Please check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Deploying to Firebase Hosting (asia-southeast1)...
echo.
call npx firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deploy failed! Please check errors above.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Pushing code to GitHub...
echo.
git add .
git commit -m "deploy: update %date% %time%"
git push origin main

echo.
echo ========================================================
echo   SUCCESS! Deployment complete.
echo   Website: https://jipatha-798.web.app
echo ========================================================
pause
