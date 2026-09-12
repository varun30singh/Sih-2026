from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import sys

# =========================================================
# PATH CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

DATABASE_PATH = os.path.join(
    BASE_DIR,
    "database",
    "procurement.db"
)

CHATBOT_PATH = os.path.join(
    BASE_DIR,
    "chatbot"
)

# Allow Python to find assistant.py
if CHATBOT_PATH not in sys.path:
    sys.path.append(CHATBOT_PATH)

from assistant import process_message, process_message_with_suggestions

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
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


# =========================================================
# FRONTEND ROUTES
# =========================================================

@app.route("/")
def index():
    """Serve the main frontend application."""
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/<path:path>")
def static_proxy(path):
    """Serve static assets or fallback to index.html."""
    target = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(target):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")


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

        return jsonify({
            "status": "healthy",
            "database": "connected",
            "chatbot": "connected"
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
        try:
            response, suggested_questions, resolved_language = process_message_with_suggestions(
                message, language=language
            )
        except Exception:
            response = process_message(message, language=language)
            suggested_questions = []
            resolved_language = language

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