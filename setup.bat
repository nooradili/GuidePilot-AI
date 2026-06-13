@echo off
echo ==========================================
echo       GUIDEPILOT AI AGENT SETUP
echo ==========================================
echo.

echo [1/4] Establishing Python Virtual Environment (venv)...
python -m venv venv
call venv\Scripts\activate

echo [2/4] Installing Python Backend dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [3/4] Initializing Database, Directories, and Ollama Models...
python -m backend.setup_models

echo [4/4] Installing Next.js Frontend NPM dependencies...
cd frontend
npm install --no-audit --no-fund
cd ..

echo.
echo ==========================================
echo   Setup Complete! Use run.bat to start.
echo ==========================================
pause
