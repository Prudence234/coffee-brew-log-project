@echo off
cd /d "%~dp0"
if not exist node_modules call npm install
if not exist backend\.env copy backend\.env.example backend\.env >nul
call npm run db:generate
call npm run db:deploy
start "Coffee Brew Backend" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 2 /nobreak >nul
start "Coffee Brew Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1"
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
