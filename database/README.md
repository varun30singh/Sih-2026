# MandiSetu Database Architecture

This directory houses the data tier for **MandiSetu** — including PostgreSQL production schemas, migrations, seed datasets, and the local SQLite demo repository.

---

## 1. Directory Structure

```
database/
├── schema/
│   └── 01_initial_schema.sql      # Core PostgreSQL DDL
├── migrations/
│   └── 01_create_tables.sql       # Versioned migration runner
├── seeds/
│   └── 01_mandi_seed_data.sql     # Seed mandis, farmers, tokens, queues
├── scripts/
│   ├── database.py                # SQLite table creator & connector
│   └── init_db.sh                 # Database initialization helper
├── procurement.db                 # Local SQLite database for ProcureAI chatbot
├── database.py                    # Backward-compatible SQLite connector
└── README.md                      # Documentation
```

---

## 2. PostgreSQL Relational Model

| Table | Purpose | Primary Key | Key Foreign Keys |
|---|---|---|---|
| `farmers` | Registered farmers with Aadhaar hash & land records | `id` | - |
| `procurement_centres` | Mandis with coordinates, capacities & processing speeds | `id` | - |
| `slots` | Daily delivery time windows per centre | `id` | `centre_id` |
| `bookings` | Slot delivery reservations made across Web, IVR, CSC | `id` | `farmer_id`, `centre_id`, `slot_id` |
| `tokens` | Non-transferable digital passes (e.g. M-142) with QR hash | `id` | `farmer_id`, `centre_id`, `booking_id` |
| `queue_entries` | Live yard sequence, stage tracking & fairness delay shields | `id` | `centre_id`, `token_id` |
| `procurements` | 8-stage grain lifecycle records, moisture %, and weighment | `id` | `farmer_id`, `centre_id` |
| `payments` | Direct Benefit Transfer (DBT) & PFMS transaction records | `id` | `farmer_id`, `procurement_id` |

---

## 3. Redis In-Memory Key Design

Redis is used strictly for low-latency live queuing, transient token states, and fast centre telemetries:

```text
# Live queue sequence for a mandi
queue:{centre_id}:live               -> LIST of token_ids in physical arrival order
queue:{centre_id}:active_count       -> INTEGER of vehicles currently in mandi yard
queue:{centre_id}:processing_rate    -> FLOAT (quintals/hour) calibrated in real-time

# Farmer / Token real-time state
token:{token_number}:state           -> HASH { status, ahead_count, eta_minutes, stage }
token:{token_number}:qr_verification -> STRING (tamper-proof HMAC hash)

# Delay Shield Fairness Sentinel
centre:{centre_id}:delay_shield      -> HASH { active: bool, reason: str, auto_reroute: bool }
```

---

## 4. Setup & Migrations

### Local SQLite (Chatbot Demo)
```bash
python database/database.py
python seed_data.py
```

### PostgreSQL (Production)
```bash
# 1. Create database
createdb -U postgres mandisetu_db

# 2. Run schema & seed
psql -U postgres -d mandisetu_db -f database/schema/01_initial_schema.sql
psql -U postgres -d mandisetu_db -f database/seeds/01_mandi_seed_data.sql
```
