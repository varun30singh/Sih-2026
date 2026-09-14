#!/usr/bin/env bash
# Development runner: Starts Next.js frontend, NestJS backend, and Python chatbot concurrently.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR="$( cd "$DIR/../.." >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

echo "Starting MandiSetu multi-service development environment..."
echo "Press Ctrl+C to terminate all services."

# Trap Ctrl+C and kill background child jobs
trap 'kill $(jobs -p) 2>/dev/null' EXIT

# 1. Start Python Chatbot Service
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python backend/app.py &
CHATBOT_PID=$!

# 2. Start NestJS Backend
npm --prefix backend run start &
BACKEND_PID=$!

# 3. Start Next.js Frontend
npm --prefix frontend run dev &
FRONTEND_PID=$!

wait
