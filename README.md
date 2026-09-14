<<<<<<< HEAD
# MandiSetu (मंडीसेतु)

> **Smart India Hackathon 2026 — Problem Statement SIH26032**  
> *Agri-Tech Zero-Waiting Procurement Queue & Mandi Logistics Platform*

---

## 1. Project Overview

**MandiSetu** is an intelligent, fair, and accessible agricultural procurement scheduling platform designed to eliminate grueling 12–36 hour tractor queues outside Indian agricultural mandis. 

By unifying virtual queuing, digital tokens, physical mandi telemetry, multi-channel accessibility (Web, IVR, SMS, CSC desks), and an AI-driven procurement intelligence assistant (**ProcureAI**), MandiSetu transforms harvest-season mandi chaos into an orchestrated Just-In-Time logistics pipeline.

---

## 2. Problem Statement (SIH26032)

During peak rabi and kharif harvest seasons, millions of Indian farmers transport grain (wheat, paddy, pulses) to government procurement centres and face:
* **Severe Waiting Times:** 12 to 36 hours waiting in tractor lines exposed to rain, rot, and pest infestations.
* **Unpredictable Bottlenecks:** A single weighbridge failure causes 4-mile highway gridlocks with zero telemetry or early warnings.
* **Touts & Queue Manipulation:** Manual paper slips are vulnerable to touts and arbitrary queue jumping.
* **Information Asymmetry:** Marginal farmers travel blindly without knowing whether nearby mandis are operational or congested.
* **Delayed DBT Payments:** Manual weighment slips delay Direct Benefit Transfer bank deposits for weeks.

---

## 3. Core Differentiating Features

1. **Smart No-Wait Arrival:** Farmers remain at home while real-time turn tracking alerts them to depart only when exactly 8 vehicles are ahead in line.
2. **Dynamic Slot Recalibration:** Mandi slowdowns trigger automatic slot adjustments or reroute suggestions to nearby relief centres.
3. **Intelligent Centre Matching:** Evaluates travel distance, queue congestion, counter speeds, and truck capacity—not just geographical distance.
4. **Digital Twin of Mandis:** 3D virtual floor plan monitors physical choke-points from Gate Entry to Weighbridges and Bagging Bays.
5. **Algorithmic Fairness Engine:** Eliminates queue jumping with audit trails and automatically shields farmers from penalties during mandi-caused breakdowns.
6. **Tamper-Proof QR Digital Tokens:** Secure digital passes (e.g. `M-142`) replace paper slips and prevent duplicate entries.
7. **Universal Accessibility:** 100% accessible via Automated Outbound Voice Calls (IVR), SMS, Gram Panchayat desks, and CSC Kendra portals for non-smartphone farmers.
8. **8-Stage Procurement Tracking & DBT:** End-to-end crop tracking from automated moisture assay (<12% FAQ) to direct bank credit through PFMS.
9. **ProcureAI Multilingual Assistant:** Hybrid NLU + database AI chatbot assisting farmers and procurement officers in English, Hindi, and Marathi.

---

## 4. System Architecture

```text
                                 MandiSetu Platform
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
      Frontend Application                             Backend Application
      Next.js 14 + TypeScript                          NestJS + TypeScript
      (Port 3000)                                      (Port 4000)
                 │                                               │
                 ├───────────────────────┬───────────────────────┤
                 │                       │                       │
           REST API / WebSocket    PostgreSQL Database      Redis In-Memory
           Client Integration      Persistent Store         Live Queue & Cache
                                   (Port 5432)              (Port 6379)
                                                                 │
                                                    ┌────────────┴────────────┐
                                                    │                         │
                                          Python AI Service           Local SQLite
                                          ProcureAI Intelligence      Demo Repository
                                          (Port 5000)                 procurement.db
                                                    │
                                            LLM + NLU Pipeline
```

---

## 5. Technology Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Backend:** Node.js, NestJS, TypeScript, Express, REST API, WebSockets
* **Primary Database:** PostgreSQL 15+ (Relational persistence)
* **Caching & Queue:** Redis 7+ (In-memory real-time queue states)
* **AI & Natural Language:** Python 3.9+, Flask, SQLite, LLM NLU Engine (OpenAI / fallback)
* **Tooling:** Monorepo architecture, npm workspaces, Bash orchestration

---

## 6. Project Directory Structure

```text
Sih-2026/
│
├── frontend/                     # Next.js 14 Web Application
│   ├── app/                      # App router pages (farmer, admin, queue, booking)
│   ├── components/               # Reusable UI components & layouts
│   ├── lib/                      # API client, mock datasets, i18n localization
│   ├── types/                    # TypeScript interfaces & domain types
│   ├── public/                   # Static assets, logos, icons
│   ├── styles/                   # Styling configurations
│   ├── legacy-chatbot/           # Standalone ProcureAI chatbot interface
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # Frontend TypeScript config
│   ├── next.config.mjs           # Next.js configuration
│   └── tailwind.config.ts        # Tailwind CSS theme
│
├── backend/                      # NestJS Application Backend
│   ├── src/
│   │   ├── modules/              # Domain modules (farmers, centres, queue, etc.)
│   │   │   ├── farmers/          # Farmer management & registration
│   │   │   ├── centres/          # Procurement centre management
│   │   │   ├── bookings/         # Slot booking engine
│   │   │   ├── tokens/           # Digital QR token generation & validation
│   │   │   ├── queue/            # Live queue state & stage advancement
│   │   │   ├── procurement/      # 8-stage grain lifecycle tracking
│   │   │   ├── payments/         # DBT & PFMS payment monitoring
│   │   │   ├── notifications/    # SMS, IVR, Push alerts
│   │   │   ├── recommendations/  # Smart centre recommendation engine
│   │   │   └── chatbot/          # Chatbot bridge to Python AI service
│   │   ├── common/               # Shared decorators, responses, guards
│   │   ├── config/               # Environment & configuration service
│   │   ├── guards/               # Auth guards
│   │   ├── middleware/           # HTTP logging & correlation middleware
│   │   ├── app.module.ts         # Root NestJS module
│   │   └── main.ts               # Application bootstrap
│   ├── test/                     # E2E & unit tests
│   ├── app.py                    # Python Flask Chatbot API service
│   ├── package.json              # Backend dependencies
│   └── tsconfig.json             # Backend TypeScript config
│
├── database/                     # Database Schemas & Migrations
│   ├── schema/                   # PostgreSQL production schemas
│   │   └── 01_initial_schema.sql
│   ├── migrations/               # Versioned database migrations
│   │   └── 01_create_tables.sql
│   ├── seeds/                    # Mandi & farmer seed data
│   │   └── 01_mandi_seed_data.sql
│   ├── scripts/                  # DB initialization scripts
│   │   ├── database.py
│   │   └── init_db.sh
│   ├── procurement.db            # Local SQLite database for Chatbot
│   └── README.md                 # Database documentation
│
├── chatbot/                      # ProcureAI Natural Language Engine
│   ├── assistant.py              # Main assistant dialogue manager
│   ├── config.py                 # LLM & runtime configuration
│   ├── llm.py                    # Natural Language Understanding (NLU)
│   ├── procurement.py            # Procurement factual retrieval engine
│   ├── suggestions.py            # Dynamic suggested questions generator
│   ├── concepts.py               # Multilingual agricultural ontology
│   ├── chat_history/             # Persistent chat histories
│   └── memory/                   # Contextual assistant memory
│
├── docs/                         # Comprehensive Documentation
│   ├── architecture/             # Architecture specifications
│   │   └── ARCHITECTURE.md
│   ├── api/                      # REST & WebSocket API references
│   │   └── API.md
│   └── setup/                    # Setup & installation guides
│       └── SETUP.md
│
├── scripts/                      # Startup & Utility Scripts
│   ├── start.sh                  # Unified multi-service runner
│   └── development/              # Development helpers
│       ├── run_dev.sh
│       └── seed.sh
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Hardened Git ignore rules
├── README.md                     # Monorepo documentation
└── package.json                  # Root monorepo workspace configuration
```

---

## 7. Installation & Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/varun30singh/Sih-2026.git
cd Sih-2026
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```
*(No sensitive keys are stored in the repo; defaults are pre-configured for local development).*

### 3. Install Dependencies
```bash
# Install root, frontend, and backend packages
npm install
npm --prefix frontend install
npm --prefix backend install

# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Initialize Demo Database
```bash
python database/database.py
python seed_data.py
```

---

## 8. Starting the Services

### Option A: Unified Startup
```bash
./start.sh
```
Launches the ProcureAI server & web portal at `http://127.0.0.1:5000`.

### Option B: Monorepo Multi-Service Mode

| Service | Command | Port / URL |
|---|---|---|
| **Frontend (Next.js)** | `npm --prefix frontend run dev` | `http://localhost:3000` |
| **Backend (NestJS)** | `npm --prefix backend run start` | `http://localhost:4000/api` |
| **AI Chatbot (Python)** | `python backend/app.py` | `http://127.0.0.1:5000` |

---

## 9. Verification & Build Commands

```bash
# Build both frontend and backend
npm run build

# Type check all TypeScript workspaces
npm run type-check

# Compile Python AI modules
python -m compileall chatbot
```

---

## 10. Team Responsibilities & Workflow

* **Frontend Developers:** Work inside `frontend/` using Next.js, TypeScript, and Tailwind CSS.
* **Backend Developers:** Develop business logic inside `backend/src/modules/` using NestJS and TypeScript.
* **Database Engineers:** Manage schemas, migrations, and seeds inside `database/`.
* **AI / ML Engineers:** Maintain NLU models, prompt templates, and ontology inside `chatbot/`.
* **Git Workflow:** Standard feature-branch workflow (`feat/`, `fix/`, `docs/`). Do not push `.env` or `venv/` to Git.
=======
MandiSetu 🌾

Smart Procurement Centre Queue & Waiting-Time Management Platform

MandiSetu is a smart digital platform designed to reduce farmer waiting time at government procurement centres by providing smart slot booking, live queue tracking, token management, procurement tracking, and intelligent centre recommendations.

The platform is designed to work for farmers using smartphones, basic phones, CSCs, Panchayats, cooperatives, and assisted booking channels.

⸻

🚀 Key Features

👨‍🌾 Farmer Management

* Farmer registration
* Farmer profile management
* Mobile number-based identification
* Land and procurement information
* Procurement and payment tracking

🎫 Smart Token & Queue Management

* Digital token generation
* Live queue position
* Estimated waiting time
* Smart arrival-time prediction
* No-Wait Arrival system
* Dynamic slot allocation
* Real-time queue updates

🏪 Smart Procurement Centre Recommendation

* Recommend the best procurement centre for a farmer
* Consider:
    * Current queue
    * Waiting time
    * Distance
    * Centre capacity
    * Availability of slots

📅 Smart Booking

* Slot booking
* Slot rescheduling
* Dynamic slot management
* Assisted booking through:
    * CSC
    * Panchayat
    * Cooperative societies
    * IVR/basic phone

💰 Procurement & Payment Tracking

* Procurement status
* Quantity procured
* Expected payment
* Payment status
* Procurement history

📊 Digital Twin Dashboard

* Live centre status
* Queue size
* Farmer arrivals
* Processing rate
* Centre capacity
* Waiting-time analytics

⚖️ Fairness & Priority Rules

* Fair queue allocation
* Priority handling
* Prevention of unfair slot allocation
* Transparent queue rules

📂 Data Management

* CSV import
* Excel import/export
* Procurement data management
* Farmer data management

🤖 AI / Chatbot

* Procurement-related queries
* Supplier/procurement information
* Delay and risk analysis
* Natural-language interaction
* Multilingual support

🛠️ Tech Stack

Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Responsive UI
* Glassmorphism UI design

Backend

* Node.js
* NestJS
* TypeScript
* REST APIs

Database

* PostgreSQL

Caching & Real-Time

* Redis

AI / Chatbot

* Python
* LLM integration
* Procurement intelligence
* Natural-language query processing

Data

* CSV
* Excel
* PostgreSQL

⸻

📁 Project Structure

Sih-2026/
│
├── frontend/              # Frontend application
│
├── backend/               # NestJS backend/API
│
├── database/              # Database-related files
│
├── chatbot/               # AI / Procurement chatbot
│
├── app/                   # Next.js application routes
│
├── components/            # Reusable UI components
│
├── lib/                   # Utility functions
│
├── types/                 # TypeScript types
│
├── public/                # Static assets
│
├── .env                   # Local environment variables
├── .gitignore
├── package.json
└── README.md

⸻

⚙️ Installation

1. Clone the Repository

git clone https://github.com/varun30singh/Sih-2026.git

Enter the project:

cd Sih-2026

⸻

🎨 Frontend Setup

Go to the frontend directory:

cd frontend

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally run at:

http://localhost:3000

⸻

⚙️ Backend Setup

Open another terminal.

Go to the backend:

cd backend

Install dependencies:

npm install

Start the backend development server:

npm run start:dev

The backend API will normally run on its configured localhost port.

Check the backend .env or configuration file for the exact port.

⸻

🤖 Chatbot Setup

Go to the chatbot directory:

cd chatbot

Create a Python virtual environment:

python3 -m venv venv

Activate it:

macOS / Linux

source venv/bin/activate

Windows

venv\Scripts\activate

Install Python dependencies:

pip install -r requirements.txt

Configure the required environment variables in .env.

Never commit .env or API keys to GitHub.

⸻

🔐 Environment Variables

Create a local .env file for required secrets and configuration.

Example:

DATABASE_URL=
REDIS_URL=
API_KEY=
LLM_API_KEY=

Do not upload real API keys or passwords to GitHub.

Instead, use:

.env.example

to show teammates which variables are required.

⸻

🗄️ Database

The project uses PostgreSQL as the primary database.

Database responsibilities include:

* Farmers
* Procurement centres
* Tokens
* Slots
* Queue information
* Procurement records
* Payments
* Centre capacity
* Booking history

Example high-level tables:

Farmers
ProcurementCentres
Bookings
Tokens
Queue
Procurements
Payments
Slots
Users

⸻

🔄 Development Workflow

Before starting work:

git pull origin main

Create a feature branch:

git checkout -b feature/your-feature-name

Example:

git checkout -b feature/queue-management

After making changes:

git status

Add your changes:

git add .

Commit:

git commit -m "Add queue management"

Push your branch:

git push origin feature/queue-management

Then create a Pull Request on GitHub.

⸻

👥 Team Development

Recommended responsibility separation:

Area	Responsibility
frontend/	UI, pages, components, user experience
backend/	APIs, authentication, business logic
database/	Schema, migrations, queries
chatbot/	AI assistant and procurement intelligence
components/	Reusable UI components
lib/	Shared utilities
types/	TypeScript interfaces/types

Avoid directly modifying another teammate’s feature branch unless necessary.

⸻

🌾 Smart No-Wait Arrival

One of the core features of MandiSetu is Smart No-Wait Arrival.

Example:

Token: M-142
Farmers ahead: 8
Estimated processing time: 45 minutes
Recommended arrival:
10:15 AM

Instead of waiting at the procurement centre from the beginning of the slot, the farmer receives an estimated arrival time based on the live queue.

⸻

📊 Centre Dashboard

The centre dashboard can display:

Current Queue
      ↓
Active Tokens
      ↓
Average Processing Time
      ↓
Expected Waiting Time
      ↓
Centre Capacity
      ↓
Today's Procurement

This allows procurement-centre administrators to monitor operations in real time.

⸻

🔮 Future Enhancements

* SMS notifications
* WhatsApp integration
* IVR integration
* Voice-based farmer assistance
* AI-based waiting-time prediction
* Weather-aware scheduling
* Advanced analytics
* Multi-language voice assistant
* Government API integration
* Mobile application
* Real-time WebSocket updates

⸻

🏆 Smart India Hackathon 2026

This project is being developed as part of Smart India Hackathon 2026.

The goal is to use technology to improve procurement-centre operations and reduce unnecessary waiting time for farmers.

⸻

👨‍💻 Development Status

🚧 Currently under active development

Features and architecture may change as development progresses.

⸻

📜 License

This project is developed for the Smart India Hackathon 2026 and is currently intended for educational and competition purposes.
>>>>>>> origin/main
