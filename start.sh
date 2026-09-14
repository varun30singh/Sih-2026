#!/usr/bin/env bash
# ============================================================
# MandiSetu & ProcureAI Startup Script
# Smart India Hackathon 2026
# ============================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

if [ -f "scripts/start.sh" ]; then
    exec ./scripts/start.sh "$@"
fi

if [ -d "venv" ]; then
    echo "⚡ Activating virtual environment..."
    source venv/bin/activate
fi

echo "🚀 Starting ProcureAI server..."
echo "🌐 Open in browser: http://127.0.0.1:5000"
python backend/app.py
