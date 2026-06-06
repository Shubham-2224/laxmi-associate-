@echo off
title Laxmi Associates - Website Server
cd /d "%~dp0"

echo.
echo  ============================================
echo    Laxmi Associates - Starting Website
echo  ============================================
echo.
echo  Website will open at: http://localhost:5500
echo.
echo  Use this to test EMAIL booking (required).
echo  Do NOT double-click index.html for email test.
echo.
echo  Press Ctrl+C to stop the server.
echo  ============================================
echo.

start "" "http://localhost:5500"
py -m http.server 5500 2>nul || python -m http.server 5500
pause
