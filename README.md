# CoreInventory - AI-Powered Warehouse & Inventory Management
### Odoo x Indus Hackathon 2026

An offline-first, AI-powered smart inventory and warehouse management system
inspired by Odoo Inventory - built for enterprises to manage warehouse operations efficiently.

---

## Team

| Member | Role |
|--------|------|
| Poojan Ashish Parekh | Full-Stack / Architecture |
| Dobariya Jainil Bhavesh | Backend / API Lead |
| Patel Pruthil Jigneshkumar | Full-Stack / Features |
| Prisha Gaurav Ajmera | QA / Enhancement |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + TypeScript |
| Backend | Node.js + custom server.ts |
| Database | SQLite via Prisma ORM |
| Real-Time | Socket.IO |
| AI Service | Python + FastAPI + Pandas + Scikit-learn |
| Offline | Service Workers + IndexedDB |
| Email | Resend / Nodemailer |

---

## Core Features

- Inventory Management - Products, stock levels, reorder rules
- Receipts - Incoming stock with Draft > Ready > Done workflow
- Deliveries - Outgoing stock with stock reservation and validation
- Move History - Full audit trail of all inventory movements
- Damage Reporting - Report rotten/damaged goods with stock auto-decrement
- Smart Alerts - Real-time Socket.IO alerts for low stock, damage, late operations
- AI Insights - Stockout risk, slow-moving products, waste analysis, warehouse performance
- Offline-First - Service Worker + IndexedDB queue with auto-sync on reconnect
- Role-Based Access - Staff and Manager roles with protected routes

---

## Project Structure
```
app/                    # Next.js 14 App Router
  (auth)/               # Login, Signup pages
  (dashboard)/          # All dashboard pages
  api/                  # REST API routes
components/             # Reusable UI components
hooks/                  # Custom React hooks
lib/                    # Utilities, auth, offline logic
prisma/                 # Schema + migrations
public/                 # Static files + Service Worker (sw.js)
ai-service/             # Python FastAPI AI microservice
docs/                   # Architecture + API documentation
demo/                   # Screenshots + demo assets
```

---

## Getting Started
```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

AI Service:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
