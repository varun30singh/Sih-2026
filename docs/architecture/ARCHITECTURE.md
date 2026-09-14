# MandiSetu System Architecture

**Smart India Hackathon 2026 — Problem Statement SIH26032**  
*Agri-Tech Zero-Waiting Procurement Queue & Mandi Logistics Platform*

---

## 1. High-Level Architecture

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

## 2. Core Service Topology

### 2.1 Next.js Frontend (`frontend/`)
* **Technology:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
* **Role:**
  * Farmer portal for Aadhaar/land registration, slot booking, live QR token tracking, and DBT payment status.
  * Admin & Mandi Operator dashboard featuring Mandi Digital Twin, dynamic delay recalibrations, and automated fairness shields.
  * Multi-language UI support (English, Hindi, Marathi).

### 2.2 NestJS Backend (`backend/`)
* **Technology:** Node.js, NestJS, TypeScript, REST API, WebSocket Gateway.
* **Role:**
  * Orchestrates business workflows across 10 core domain modules:
    * `farmers`: Registrations, land record validation, language preferences.
    * `centres`: Procurement centres, geo-coordinates, active counters, throughput speeds.
    * `bookings`: Slot booking and assisted operator reservations.
    * `tokens`: Non-transferable QR digital passes (e.g. `M-142`).
    * `queue`: Live sequence, stage transitions, yard capacity enforcement.
    * `procurement`: 8-stage grain lifecycle tracking (moisture assay, weighbridge, bagging).
    * `payments`: Direct Benefit Transfer (DBT) and PFMS voucher tracking.
    * `notifications`: Multi-channel alerts (SMS, Automated IVR voice calls, Push).
    * `recommendations`: Multi-factor mandi load-balancing engine.
    * `chatbot`: REST bridge to the Python AI service.

### 2.3 Python AI Intelligence Service (`chatbot/`)
* **Technology:** Python 3.9+, Flask, SQLite, LLM Integration (OpenAI / local model fallback).
* **Role:**
  * Multilingual Natural Language Understanding (NLU) for procurement queries in English, Hindi, and Marathi.
  * Real-time query execution against verified procurement datasets.
  * Contextual follow-up suggestions and risk analysis.

### 2.4 Data Tier (`database/`)
* **Primary Store:** PostgreSQL 15+ for relational persistence (farmers, centres, bookings, audit records).
* **In-Memory Cache:** Redis 7+ for low-latency live queue sequences, vehicle yard counters, and delay shield flags.
* **Demo Store:** SQLite (`database/procurement.db`) for lightweight self-contained hackathon demonstrations.

---

## 3. Key Algorithmic Innovations

### 3.1 Smart No-Wait Arrival
Calculates dynamic departure time for farmers:
$$\text{Recommended Arrival} = \text{Current Time} + \left(\frac{\text{Farmers Ahead}}{\text{Active Counters}} \times \text{Avg Turnaround}\right) - \text{Estimated Travel Time}$$

When a farmer reaches exactly 8 vehicles ahead in line, outbound IVR and SMS push notifications trigger an alert: *"8 farmers ahead at Meerut Mandi. Please depart from home now."*

### 3.2 Dynamic Load Balancing & Recommendation
Rather than routing farmers strictly by geographical proximity, MandiSetu evaluates:
* Physical distance ($D$)
* Real-time queue delay ($W$)
* Counter processing throughput ($P$)
* Yard truck capacity ($C$)

$$\text{Score} = w_1 \cdot \text{Normalized Distance} + w_2 \cdot \text{Wait Time} + w_3 \cdot \text{Congestion Ratio}$$

### 3.3 Delay Protection & Algorithmic Fairness Shield
When equipment bottlenecks occur (e.g. weighbridge recalibration), the system automatically freezes delay penalties, shields affected farmers' priority, and alerts incoming vehicles to pause or reroute.
