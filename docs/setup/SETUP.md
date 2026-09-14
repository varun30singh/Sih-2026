# MandiSetu Developer Setup & Installation Guide

This guide details instructions for setting up, configuring, and running the **MandiSetu** monorepo on your local machine.

---

## 1. Prerequisites

* **Node.js:** v18.0+ or v20.0+ (LTS recommended)
* **npm:** v9.0+ or v10.0+
* **Python:** v3.9+ or v3.10+
* **Git:** v2.30+
* **PostgreSQL** *(optional for production test)*: v15+
* **Redis** *(optional for production test)*: v7+

---

## 2. Quick Start

### Step 1: Clone Repository
```bash
git clone https://github.com/varun30singh/Sih-2026.git
cd Sih-2026
```

### Step 2: Configure Environment
Copy the configuration template:
```bash
cp .env.example .env
```
Edit `.env` to provide your configuration if using custom database credentials or LLM API keys.

### Step 3: Install Dependencies
```bash
# Install frontend dependencies
npm --prefix frontend install

# Install backend dependencies
npm --prefix backend install

# Set up Python virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 4: Initialize Databases
```bash
# Initialize SQLite demo database for ProcureAI Chatbot
python database/database.py
python seed_data.py
```

---

## 3. Running the Services

### Option A: Standard Single-Service Startup (Default Hackathon Mode)
```bash
./start.sh
```
This launches the ProcureAI Intelligence backend & standalone web interface at:
* **Chatbot Web UI & API:** `http://127.0.0.1:5000`

### Option B: Full Monorepo Multi-Terminal Mode

**Terminal 1 — Next.js Frontend:**
```bash
npm --prefix frontend run dev
```
Accessible at: `http://localhost:3000`

**Terminal 2 — NestJS Application Backend:**
```bash
npm --prefix backend run start:dev
```
Accessible at: `http://localhost:4000/api`

**Terminal 3 — Python ProcureAI Chatbot Service:**
```bash
source venv/bin/activate
python backend/app.py
```
Accessible at: `http://127.0.0.1:5000`

---

## 4. Verification & Testing

### Build Monorepo
```bash
npm run build
```

### Run Type Checks
```bash
npm run type-check
```

### Compile Python Chatbot Logic
```bash
python -m compileall chatbot
```
