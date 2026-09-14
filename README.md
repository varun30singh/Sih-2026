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
