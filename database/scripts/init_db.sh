#!/usr/bin/env bash
# Database Initialization Script for MandiSetu
# Initializes SQLite demo database and prints PostgreSQL setup instructions.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR="$( cd "$DIR/../.." >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

echo "=================================================="
echo "📦 MandiSetu Database Initializer"
echo "=================================================="

# 1. Initialize SQLite Database for ProcureAI Chatbot
echo "🔹 Initializing SQLite procurement database..."
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python database/database.py
python seed_data.py

echo ""
echo "✅ SQLite database setup complete at database/procurement.db"
echo ""
echo "🔹 To initialize PostgreSQL production database, run:"
echo "   psql -U postgres -d mandisetu_db -f database/schema/01_initial_schema.sql"
echo "   psql -U postgres -d mandisetu_db -f database/seeds/01_mandi_seed_data.sql"
echo "=================================================="
