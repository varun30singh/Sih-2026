# MandiSetu REST & WebSocket API Specification

This document details the public and internal APIs provided across the MandiSetu platform.

---

## 1. NestJS Backend APIs (`http://localhost:4000/api`)

### Health Check
* **Endpoint:** `GET /health`
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "MandiSetu NestJS Platform",
  "timestamp": "2026-09-14T06:30:00.000Z"
}
```

### Procurement Centres
* **Endpoint:** `GET /centres`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "centre-14",
      "name": "Meerut Grain Mandi #14",
      "district": "Meerut",
      "state": "Uttar Pradesh",
      "activeCounters": 3,
      "processingRateQtlPerHr": 140.0,
      "currentWaitMinutes": 42,
      "status": "ACTIVE"
    }
  ]
}
```

### Live Queue State
* **Endpoint:** `GET /admin/queue/state?centreId=centre-14`
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "centreId": "centre-14",
    "currentServingToken": "M-134",
    "nextServingToken": "M-135",
    "activeVehiclesInYard": 14,
    "averageTurnaroundMinutes": 18,
    "delayShieldActive": false
  }
}
```

### Digital Tokens
* **Endpoint:** `GET /tokens/:tokenNumber` (e.g. `/tokens/M-142`)
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "tokenNumber": "M-142",
    "farmerName": "Ramesh Singh",
    "crop": "Wheat (Sharbati)",
    "farmersAhead": 8,
    "estimatedWaitMinutes": 42,
    "recommendedArrival": "10:45 AM",
    "status": "ON_TRACK",
    "qrHash": "M142-SECURE-SHA256-HASH"
  }
}
```

### Smart Mandi Recommendations
* **Endpoint:** `POST /recommendations/smart-centres`
* **Body:**
```json
{
  "cropType": "Wheat",
  "quantityQtl": 30,
  "farmerCoordinates": { "latitude": 28.9845, "longitude": 77.7064 }
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recommendedCentre": {
      "id": "centre-08",
      "name": "Modinagar Relief Mandi #08",
      "distanceKm": 6.2,
      "currentWaitMinutes": 25,
      "recommended": true,
      "reason": "Optimal turnaround. Saves ~85 minutes over congested mandis."
    }
  }
}
```

---

## 2. ProcureAI Python Intelligence APIs (`http://127.0.0.1:5000/api`)

### Health Check
* **Endpoint:** `GET /api/health`
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "chatbot": "connected"
}
```

### Chatbot Dialogue & Analysis
* **Endpoint:** `POST /api/chat`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "message": "Show me delayed procurements",
  "language": "english"
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "message": "Show me delayed procurements",
  "response": "7 delayed order(s) found (58.33% of 12 orders):\n• PR001 (Industrial Bearings) — SKF India — 9 day(s) overdue\n• PR002 (Steel Sheets) — Tata Steel — 7 day(s) overdue",
  "language": "english",
  "suggested_questions": [
    "Which supplier has a better delay rate?",
    "What is Siemens India's performance score?",
    "Which procurement is most urgent?"
  ]
}
```

### Procurement Summary
* **Endpoint:** `GET /api/summary`
* **Response (200 OK):**
```json
{
  "success": true,
  "total_orders": 12,
  "total_cost": 10893500.0,
  "delayed_orders": 4,
  "urgent_orders": 7,
  "unique_suppliers": 10
}
```
