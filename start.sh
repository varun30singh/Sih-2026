#!/usr/bin/env bash
# ProcureAI Startup Script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ -d "venv" ]; then
    echo "⚡ Activating virtual environment..."
    source venv/bin/activate
fi

echo "🚀 Starting ProcureAI server..."
echo "🌐 Open in browser: http://127.0.0.1:5000"
python backend/app.py
