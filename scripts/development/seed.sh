#!/usr/bin/env bash
# Database Seeder helper
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR="$( cd "$DIR/../.." >/dev/null 2>&1 && pwd )"
cd "$PROJECT_DIR"

if [ -d "venv" ]; then
    source venv/bin/activate
fi
python database/database.py
python seed_data.py
echo "✅ Database seeded successfully."
