@echo off
setlocal

echo ==========================================
echo       InkTeX Launcher (Windows)
echo ==========================================

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install it from https://nodejs.org/
    pause
    exit /b
)

:: Check for .env.local
if not exist ".env.local" (
    echo [WARNING] .env.local not found!
    if exist ".env.local.example" (
        echo [INFO] Creating .env.local from example...
        copy .env.local.example .env.local >nul
        echo [IMPORTANT] Please open .env.local and set your GEMINI_API_KEY before using AI features.
        timeout /t 3
    ) else (
        echo [ERROR] .env.local.example missing. Please check your project files.
    )
)

:: Check for node_modules and install if missing
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed.
        pause
        exit /b
    )
)

echo [INFO] Starting InkTeX development server...
echo [INFO] Opening browser...

:: Start browser in parallel after a brief delay
start "" "http://localhost:3000"

:: Start Next.js
:: Start Next.js on all interfaces
call npx next dev -H 0.0.0.0

pause
