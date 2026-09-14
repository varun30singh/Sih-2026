from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import sys

# =========================================================
# =========================================================
# PATH CONFIGURATION
# =========================================================

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BACKEND_DIR)

# Locate frontend files (check legacy-chatbot directory first, then root frontend)
if os.path.exists(os.path.join(BASE_DIR, "frontend", "legacy-chatbot", "index.html")):
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "legacy-chatbot")
elif os.path.exists(os.path.join(BASE_DIR, "frontend", "index.html")):
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
else:
    FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

DATABASE_PATH = os.path.join(BASE_DIR, "database", "procurement.db")
if not os.path.exists(DATABASE_PATH):
    DATABASE_PATH = os.path.join(BACKEND_DIR, "database", "procurement.db")

CHATBOT_PATH = os.path.join(BASE_DIR, "chatbot")
if not os.path.exists(CHATBOT_PATH):
    CHATBOT_PATH = os.path.join(BACKEND_DIR, "chatbot")

# Allow Python to import assistant from the chatbot directory
if CHATBOT_PATH not in sys.path:
    sys.path.append(CHATBOT_PATH)

try:
    from assistant import process_message, process_message_with_suggestions
except ImportError:
    process_message = None
    process_message_with_suggestions = None

# =========================================================
# FLASK CONFIGURATION
# =========================================================

app = Flask(
    __name__,
    static_folder=FRONTEND_DIR,
    static_url_path=""
)
CORS(app)


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_db_connection():
    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row

    # Ensure table exists
    cursor = connection.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='procurements'")
    if not cursor.fetchone():
        try:
            database_py = os.path.join(BASE_DIR, "database", "database.py")
            if os.path.exists(database_py):
                import importlib.util
                spec = importlib.util.spec_from_file_location("db_init", database_py)
                db_init = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(db_init)
                db_init.create_tables()
                db_init.insert_sample_data()
        except Exception as e:
            print(f"Warning: Auto-init database failed: {e}")

    return connection


# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def index():
    """Serve frontend index if present, or return service overview JSON."""
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index_file):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({
        "service": "ProcureAI Intelligence & Chatbot Service",
        "status": "online",
        "mandi_frontend": "http://localhost:3000",
        "api_endpoints": {
            "overview": "/api",
            "health": "/api/health",
            "chat": "/api/chat (POST)",
            "procurements": "/api/procurements"
        }
    })


@app.route("/legacy-chatbot")
@app.route("/legacy-chatbot/")
def legacy_chatbot_index():
    """Serve legacy chatbot index or API status."""
    return index()


@app.route("/<path:path>")
def static_proxy(path):
    """Serve static assets or fallback to index or 404."""
    target = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(target):
        return send_from_directory(FRONTEND_DIR, path)
    index_file = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(index_file):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return jsonify({
        "error": "Not Found",
        "path": f"/{path}",
        "message": "Resource not found on ProcureAI service."
    }), 404


# =========================================================
# API OVERVIEW
# =========================================================

@app.route("/api")
@app.route("/api/status")
def api_status():
    """API overview and available endpoints."""
    return jsonify({
        "status": "online",
        "service": "ProcureAI Intelligence Platform",
        "problem_statement": "SIH26032 - Procurement Scheduling",
        "version": "1.0",
        "endpoints": {
            "health": "/api/health",
            "chat": "/api/chat (POST)",
            "all_procurements": "/api/procurements",
            "delayed_procurements": "/api/procurements/delayed",
            "urgent_procurements": "/api/procurements/urgent",
            "upcoming_procurements": "/api/procurements/upcoming",
            "summary": "/api/summary"
        }
    })


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health")
def health():
    try:
        connection = get_db_connection()

        connection.execute(
            "SELECT 1"
        ).fetchone()

        connection.close()

        chatbot_ready = (process_message is not None or process_message_with_suggestions is not None)

        return jsonify({
            "status": "healthy",
            "database": "connected",
            "chatbot": "connected" if chatbot_ready else "unavailable"
        })

    except Exception as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 500


# =========================================================
# GET ALL PROCUREMENTS
# =========================================================

@app.route("/api/procurements", methods=["GET"])
def get_procurements():

    try:
        connection = get_db_connection()

        procurements = connection.execute(
            """
            SELECT *
            FROM procurements
            ORDER BY expected_date
            """
        ).fetchall()

        connection.close()

        data = [
            dict(row)
            for row in procurements
        ]

        return jsonify({
            "success": True,
            "count": len(data),
            "procurements": data
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# GET DELAYED PROCUREMENTS
# =========================================================

@app.route("/api/procurements/delayed", methods=["GET"])
def get_delayed_procurements():

    try:
        connection = get_db_connection()

        procurements = connection.execute(
            """
            SELECT *
            FROM procurements
            WHERE status = 'Delayed'
            ORDER BY expected_date
            """
        ).fetchall()

        connection.close()

        data = [
            dict(row)
            for row in procurements
        ]

        return jsonify({
            "success": True,
            "count": len(data),
            "procurements": data
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# GET URGENT PROCUREMENTS
# =========================================================

@app.route("/api/procurements/urgent", methods=["GET"])
def get_urgent_procurements():

    try:
        connection = get_db_connection()

        procurements = connection.execute(
            """
            SELECT *
            FROM procurements
            WHERE priority IN ('Critical', 'High')
            ORDER BY
                CASE priority
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    ELSE 3
                END,
                expected_date
            """
        ).fetchall()

        connection.close()

        data = [
            dict(row)
            for row in procurements
        ]

        return jsonify({
            "success": True,
            "count": len(data),
            "procurements": data
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# GET UPCOMING PROCUREMENTS
# =========================================================

@app.route("/api/procurements/upcoming", methods=["GET"])
def get_upcoming_procurements():
    """Retrieve upcoming procurement schedules."""
    try:
        connection = get_db_connection()
        procurements = connection.execute(
            """
            SELECT *
            FROM procurements
            WHERE status NOT IN ('Delivered', 'Cancelled')
            ORDER BY expected_date ASC
            """
        ).fetchall()
        connection.close()

        data = [dict(row) for row in procurements]

        return jsonify({
            "success": True,
            "count": len(data),
            "procurements": data
        })

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# GET PROCUREMENT SUMMARY / STATS
# =========================================================

@app.route("/api/summary", methods=["GET"])
def get_procurement_summary():
    """Retrieve top-level procurement metrics for dashboards."""
    try:
        connection = get_db_connection()
        total_orders = connection.execute("SELECT COUNT(*) FROM procurements").fetchone()[0]
        total_cost = connection.execute("SELECT COALESCE(SUM(quantity * unit_price), 0.0) FROM procurements").fetchone()[0]
        delayed = connection.execute("SELECT COUNT(*) FROM procurements WHERE status = 'Delayed'").fetchone()[0]
        urgent = connection.execute("SELECT COUNT(*) FROM procurements WHERE priority IN ('Critical', 'High')").fetchone()[0]
        suppliers = connection.execute("SELECT COUNT(DISTINCT supplier) FROM procurements").fetchone()[0]
        connection.close()

        return jsonify({
            "success": True,
            "total_orders": total_orders,
            "total_cost": round(float(total_cost), 2),
            "delayed_orders": delayed,
            "urgent_orders": urgent,
            "unique_suppliers": suppliers
        })

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# CHATBOT API
# =========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        # Get JSON sent by frontend
        data = request.get_json(silent=True)

        # Check whether data was received
        if not data:

            return jsonify({
                "success": False,
                "error": "No data received."
            }), 400

        # Get user's message
        message = data.get("message", "").strip()

        # Check empty message
        if not message:

            return jsonify({
                "success": False,
                "error": "Message cannot be empty."
            }), 400

        # Get selected language (english, hindi, marathi)
        language = data.get("language")

        # Send message to Procurement AI
        if process_message_with_suggestions:
            try:
                response, suggested_questions, resolved_language = process_message_with_suggestions(
                    message, language=language
                )
            except Exception as exc:
                if process_message:
                    response = process_message(message, language=language)
                    suggested_questions = []
                    resolved_language = language
                else:
                    raise exc
        elif process_message:
            response = process_message(message, language=language)
            suggested_questions = []
            resolved_language = language
        else:
            return jsonify({
                "success": False,
                "error": "ProcureAI assistant engine is currently unavailable."
            }), 503

        # Return AI response with suggested questions
        return jsonify({
            "success": True,
            "message": message,
            "response": response,
            "language": resolved_language or language,
            "suggested_questions": suggested_questions
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    print()
    print("==============================================")
    print("🤖 ProcureAI Backend & Web Interface")
    print("==============================================")
    print("📦 Database:", DATABASE_PATH)
    print("🧠 Chatbot: Connected")
    print("🌐 Web App: http://127.0.0.1:5000")
    print("📡 REST API: http://127.0.0.1:5000/api")
    print("==============================================")
    print()

    port = int(os.getenv("PORT", 5000))
    app.run(
        host="0.0.0.0",
        debug=True,
        port=port
    )