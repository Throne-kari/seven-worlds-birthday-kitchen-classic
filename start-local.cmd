@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 is required. Install Node.js and try again.
  pause
  exit /b 1
)
if not exist node_modules (
  call npm.cmd ci --offline=false --cache .npm-cache
  if errorlevel 1 exit /b 1
)
echo Open http://127.0.0.1:5176/ after the server starts.
call npm.cmd run dev
