import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "database" / "procurement.db"
if not DB_PATH.exists():
    DB_PATH = Path(__file__).resolve().parent / "database" / "procurement.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Check existing table
cursor.execute("""
SELECT name
FROM sqlite_master
WHERE type='table' AND name='procurements'
""")

if not cursor.fetchone():
    print("❌ Table 'procurements' does not exist.")
    print("Please check your database schema.")
    conn.close()
    raise SystemExit(1)

# Clear old demo data
cursor.execute("DELETE FROM procurements")

# Insert realistic procurement data
data = [
    ("PR001", "Industrial Bearings", "SKF India", 500, 1250, "Delayed", "Critical", "2026-09-05"),
    ("PR002", "Steel Sheets", "Tata Steel", 1000, 850, "Delayed", "High", "2026-09-07"),
    ("PR003", "Hydraulic Pumps", "Bosch India", 100, 12500, "Scheduled", "Medium", "2026-09-12"),
    ("PR004", "Electric Motors", "Siemens India", 80, 18500, "Ordered", "High", "2026-09-11"),
    ("PR005", "Copper Cables", "Polycab", 2000, 420, "Delivered", "Low", "2026-09-03"),
    ("PR006", "Control Panels", "Schneider Electric", 25, 45000, "Pending", "Critical", "2026-09-14"),
    ("PR007", "Gear Assemblies", "SKF India", 150, 7200, "Delayed", "High", "2026-09-06"),
    ("PR008", "Safety Valves", "L&T", 300, 2100, "Scheduled", "Medium", "2026-09-15"),
    ("PR009", "PLC Controllers", "Siemens India", 20, 65000, "Pending", "Critical", "2026-09-13"),
    ("PR010", "Aluminium Sheets", "Hindalco", 800, 620, "Delivered", "Low", "2026-09-04"),
    ("PR011", "Pressure Sensors", "Honeywell", 75, 8500, "Delayed", "High", "2026-09-08"),
    ("PR012", "Industrial Filters", "Donaldson", 400, 1450, "Ordered", "Medium", "2026-09-16"),
]

cursor.executemany("""
INSERT INTO procurements
(
    procurement_id,
    item_name,
    supplier,
    quantity,
    unit_price,
    status,
    priority,
    expected_date
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
""", data)

conn.commit()

cursor.execute("SELECT COUNT(*) FROM procurements")
count = cursor.fetchone()[0]

print("=" * 60)
print("✅ PROCUREAI DATABASE SEEDED")
print("=" * 60)
print(f"Database: {DB_PATH}")
print(f"Procurements inserted: {count}")

print("\nSuppliers:")
cursor.execute("""
SELECT supplier, COUNT(*)
FROM procurements
GROUP BY supplier
ORDER BY supplier
""")

for supplier, total in cursor.fetchall():
    print(f"  • {supplier}: {total} order(s)")

conn.close()
