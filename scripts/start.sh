#!/usr/bin/env bash
# ============================================================
# MANDISETU - UNIFIED SERVICE RUNNER
# Smart India Hackathon 2026 (Problem Statement SIH26032)
# ============================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR="$( cd "$DIR/.." >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

MODE="${1:-all}"

print_header() {
    echo "=================================================="
    echo "🌾 MandiSetu - Smart Procurement Queue Platform"
    echo "=================================================="
}

start_chatbot() {
    echo "🤖 Starting ProcureAI Chatbot & Intelligence Service (Port 5000)..."
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    python backend/app.py
}

start_backend() {
    echo "🚀 Starting MandiSetu NestJS Backend (Port 4000)..."
    npm --prefix backend run start
}

start_frontend() {
    echo "💻 Starting MandiSetu Next.js Web Frontend (Port 3000)..."
    npm --prefix frontend run dev
}

print_header

case "$MODE" in
    --chatbot|chatbot)
        start_chatbot
        ;;
    --backend|backend)
        start_backend
        ;;
    --frontend|frontend)
        start_frontend
        ;;
    --all|all)
        echo "🌐 Starting all MandiSetu Services concurrently:"
        echo "   • Chatbot:   http://127.0.0.1:5000"
        echo "   • Backend:   http://localhost:4000/api"
        echo "   • Frontend:  http://localhost:3000"
        echo "=================================================="
        trap 'kill $(jobs -p) 2>/dev/null' EXIT INT TERM
        start_chatbot &
        start_backend &
        start_frontend &
        wait
        ;;
    *)
        echo "Starting Chatbot Service (Port 5000)..."
        start_chatbot
        ;;
esac
