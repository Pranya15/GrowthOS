@echo off
cd /d "%~dp0"
echo Cleaning stale Next.js build output...
if exist ".next" rd /s /q ".next"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Stopping process on port 3000: %%p
  taskkill /PID %%p /F >nul 2>&1
)
echo Starting Growth OS on http://127.0.0.1:3000
echo Keep this window open while using the app.
npm.cmd run dev
