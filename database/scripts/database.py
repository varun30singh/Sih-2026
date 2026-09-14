import sqlite3
import os

DATABASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "procurement.db"
)


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS procurements (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            procurement_id TEXT UNIQUE NOT NULL,

            item_name TEXT NOT NULL,

            category TEXT,

            quantity INTEGER,

            supplier TEXT,

            order_date TEXT,

            expected_date TEXT,

            actual_date TEXT,

            status TEXT,

            priority TEXT,

            department TEXT,

            unit_price REAL

        )
    """)

    connection.commit()
    connection.close()


def insert_sample_data():

    connection = get_connection()
    cursor = connection.cursor()

    procurements = [

        (
            "PR001",
            "Steel Sheets",
            "Raw Material",
            500,
            "Tata Steel",
            "2026-09-01",
            "2026-09-08",
            None,
            "Delayed",
            "High",
            "Manufacturing",
            75.50
        ),

        (
            "PR002",
            "Copper Wire",
            "Electrical",
            1000,
            "Hindalco",
            "2026-09-03",
            "2026-09-10",
            None,
            "Scheduled",
            "Medium",
            "Electrical",
            120.00
        ),

        (
            "PR003",
            "Safety Helmets",
            "Safety",
            250,
            "Karam Safety",
            "2026-09-02",
            "2026-09-09",
            None,
            "Scheduled",
            "High",
            "Safety",
            450.00
        ),

        (
            "PR004",
            "Industrial Bearings",
            "Machinery",
            150,
            "SKF India",
            "2026-08-25",
            "2026-09-05",
            None,
            "Delayed",
            "Critical",
            "Maintenance",
            850.00
        ),

        (
            "PR005",
            "Packaging Boxes",
            "Packaging",
            5000,
            "UFlex",
            "2026-09-05",
            "2026-09-12",
            None,
            "Scheduled",
            "Low",
            "Packaging",
            25.00
        )

    ]

    for procurement in procurements:

        try:

            cursor.execute("""
                INSERT INTO procurements (
                    procurement_id,
                    item_name,
                    category,
                    quantity,
                    supplier,
                    order_date,
                    expected_date,
                    actual_date,
                    status,
                    priority,
                    department,
                    unit_price
                )

                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

            """, procurement)

        except sqlite3.IntegrityError:

            pass

    connection.commit()
    connection.close()


if __name__ == "__main__":

    create_tables()

    insert_sample_data()

    print("✅ Procurement database created successfully.")

    print("📦 Sample procurement data inserted.")