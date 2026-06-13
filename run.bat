@echo off
setlocal enabledelayedexpansion
echo.
echo ==========================================
echo       GUIDEPILOT AI  ^|  LAUNCH SYSTEM
echo ==========================================
echo.

:: ── Optional: run unit tests first ──────────────────────────
if "%1"=="--test" (
    echo Running Enhancement Verification Suite...
    call venv\Scripts\activate.bat
    python -m unittest backend.test_enhancements -v
    echo.
    echo Tests complete. Press any key to continue launch.
    pause >nul
)

:: ── FastAPI Backend ──────────────────────────────────────────
echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "GuidePilot Backend" /D "%~dp0" cmd /c "call venv\Scripts\activate.bat && uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait for backend to bind before starting frontend
timeout /t 4 /nobreak >nul

:: ── Next.js Frontend ─────────────────────────────────────────
echo [2/2] Starting Next.js Dashboard on http://localhost:3000 ...
start "GuidePilot Frontend" /D "%~dp0frontend" cmd /c "npm run dev"

:: Brief pause then open browser
timeout /t 6 /nobreak >nul
start "" "http://localhost:3000"

echo.
echo ==========================================
echo   GuidePilot AI is RUNNING!
echo.
echo   Dashboard   : http://localhost:3000
echo   Judge Arena : http://localhost:3000/judge
echo   API Docs    : http://localhost:8000/docs
echo   Health      : http://localhost:8000/api/health
echo.
echo   Tip: .\run.bat --test  to verify enhancements first.
echo ==========================================
echo.
