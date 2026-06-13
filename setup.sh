#!/bin/bash

echo "=========================================="
echo "      GUIDEPILOT AI AGENT SETUP"
echo "=========================================="
echo ""

echo "[1/4] Establishing Python Virtual Environment (venv)..."
python3 -m venv venv
source venv/bin/activate

echo "[2/4] Installing Python Backend dependencies..."
python3 -m pip install --upgrade pip
pip install -r requirements.txt

echo "[3/4] Initializing Database, Directories, and Ollama Models..."
python3 -m backend.setup_models

echo "[4/4] Installing Next.js Frontend NPM dependencies..."
cd frontend
npm install --no-audit --no-fund
cd ..

echo ""
echo "=========================================="
echo "  Setup Complete! Start servers with:"
echo "  FastAPI: uvicorn backend.main:app --port 8000"
echo "  Frontend: cd frontend && npm run dev"
echo "=========================================="
