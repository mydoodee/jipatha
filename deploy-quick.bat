@echo off
chcp 65001 >nul
echo ========================================================
echo   Jipatha - Quick Update (Deploy Only)
echo   Skip build if no code changes
echo ========================================================
echo.

echo Deploying to Firebase Hosting...
echo.
call npx firebase deploy --only hosting
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deploy failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo   SUCCESS! Deploy complete.
echo   Website: https://jipatha-798.web.app
echo ========================================================
pause
