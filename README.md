# ReachInbox — Full-Stack Email Scheduler

A robust, production-grade email scheduling application built for the ReachInbox Software Development Intern assignment. Features delayed queue processing via BullMQ & Redis, relational state in PostgreSQL via Prisma, atomic distributed hourly rate limiting per sender, Nodemailer with Ethereal SMTP test delivery, Elasticsearch indexing, live Bull Board queue monitoring, and Slack notifications.

---

## 1. System Architecture

```mermaid
flowchart TD
    User["Client (React + Vite + Tailwind)"] -->|HTTP / REST API| Server["Express.js Server (Port 5000)"]
    Server -->|Read / Write| PG[("PostgreSQL (Prisma ORM)")]
    Server -->|Add Delayed Job| Queue["BullMQ Queue (Redis)"]
    Server -->|Sync Index| ES[("Elasticsearch")]

    Worker["BullMQ Worker (email.worker.ts)"] -->|Poll / Receive Job| Queue
    Worker -->|1. Idempotency Check| PG
    Worker -->|2. Check Hourly Limit (Lua Script)| RedisLimit[("Redis Rate Limiter")]
    Worker -->|3. If Limit Hit -> Alert| Slack["Slack API Notification"]
    Worker -->|4. If Limit Hit -> Reschedule| Queue
    Worker -->|5. Deliver Email| Ethereal["Ethereal SMTP"]
    Worker -->|6. Record Status & Preview URL| PG
    Worker -->|7. Update Index| ES

    Monitor["Bull Board Dashboard"] -->|Live Monitor| Queue
```

---

## 2. SOLID Principles & Design Decisions

1. **Single Responsibility Principle (SRP):**
   - Controllers handle HTTP parsing and response formatting.
   - Services implement business rules (scheduling delay math, campaign splitting).
   - Repositories encapsulate database queries (`ScheduledEmail`, `Campaign`).
   - `DistributedRateLimiter` is solely responsible for atomic Redis sliding window quotas.
2. **Open / Closed Principle (OCP):**
   - The email subsystem defines an `IEmailTransport` interface (`sendEmail`). The system currently uses `EtherealEmailTransport`, but Amazon SES, SendGrid, or Resend can be swapped in without modifying worker or scheduling logic.
3. **Liskov Substitution Principle (LSP):**
   - Any concrete transport implementing `IEmailTransport` behaves identically and returns uniform `{ success, messageId, previewUrl, error }` results.
4. **Interface Segregation Principle (ISP):**
   - Clean, lightweight interfaces (`SendEmailOptions`, `RateLimitCheckResult`, `EmailJobData`) prevent components from depending on unused fields.
5. **Dependency Inversion Principle (DIP):**
   - Worker and scheduling services interact with the transport abstraction rather than tightly coupling to Nodemailer.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js, TypeScript (`tsx`), Prisma ORM.
- **Database:** PostgreSQL (Authoritative source of truth).
- **Queue & Distributed Coordination:** BullMQ, Redis (via `ioredis`).
- **Rate Limiting:** Atomic Redis Lua scripts enforcing hourly limits per sender and minimum send delays.
- **Search:** Elasticsearch (`@elastic/elasticsearch`) with user-isolated queries.
- **SMTP Testing:** Nodemailer + Ethereal Email (with instant web preview URLs).
- **Monitoring:** Bull Board (`@bull-board/api` & `@bull-board/express`) mounted at `/admin/queues`.
- **Integrations:** Google OAuth 2.0 & Slack Web API.

---

## 4. Prerequisites

1. **Node.js** (v18 or higher) and **npm**
2. **PostgreSQL 14+** (e.g. PostgreSQL 18 on Windows)
3. **Redis** (Local Windows service, WSL, or hosted Redis e.g. Upstash)
4. **Elasticsearch** (Optional: local port 9200 or Elastic Cloud; graceful fallback to PostgreSQL search if unavailable)

---

## 5. Quick Start Instructions (Windows)

### Step 1: Clone and install dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Inside `backend/`, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your PostgreSQL password in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/reachinbox"
```

### Step 3: Run Database Migrations
Make sure your PostgreSQL server is running and the database `reachinbox` has been created in pgAdmin:
```bash
cd backend
npx prisma migrate dev --name init
```

### Step 4: Start the Services

Open 3 separate terminal tabs:

**Terminal 1 — API Server:**
```bash
cd backend
npm run dev
# Running at http://localhost:5000
# Bull Board monitor at http://localhost:5000/admin/queues
```

**Terminal 2 — Background Worker:**
```bash
cd backend
npm run worker
# Processes delayed email jobs, hourly rate limits & retries
```

**Terminal 3 — Frontend Dashboard:**
```bash
cd frontend
npm run dev
# Running at http://localhost:5173
```

---

## 6. Email Scheduling, Concurrency & Rate Limiting

### Scheduling Flow:
1. User enters recipient(s) directly or uploads a CSV file in the Compose modal.
2. The Express API parses and validates all email addresses using Zod.
3. PostgreSQL records the campaign and scheduled emails with unique idempotency keys.
4. One BullMQ job per recipient is added with a delayed execution timestamp (`delay = scheduledAt - now`).
5. A background worker picks up the job when due.

### Atomic Hourly Rate Limiting:
- Rate limits are stored under `ratelimit:hourly:{senderId}:{YYYY-MM-DDTHH}`.
- An atomic **Redis Lua script** checks and increments the counter in a single atomic operation:
  - If `count > MAX_EMAILS_PER_HOUR_PER_SENDER`, the job is **not dropped or failed**; it is rescheduled for the start of the next hour window.
  - A deduplicated **Slack alert** is dispatched to the user's connected Slack channel so the user is immediately notified.
- Inter-send delays (`MIN_DELAY_BETWEEN_EMAILS_MS`) prevent hammering SMTP servers.

### Restart & Crash Recovery (Reconciliation Mechanism):
- If the server restarts while jobs were pending, the server startup sequence executes `emailService.reconcilePendingEmails()`. Any records stuck in `SCHEDULED` status are automatically re-enqueued into BullMQ.
- BullMQ persistent Redis streams ensure jobs survive server restarts.

---

## 7. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/admin/queues` | Live Bull Board queue monitor |
| `GET` | `/api/auth/google` | Google OAuth redirect |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/auth/dev-login` | Instant developer login (Dev Mode) |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `POST` | `/api/auth/logout` | Session logout |
| `POST` | `/api/emails/schedule` | Schedule a single email |
| `GET` | `/api/emails/scheduled` | List pending / scheduled emails |
| `GET` | `/api/emails/sent` | List dispatched / sent emails |
| `GET` | `/api/emails/search` | Search emails (Elasticsearch / DB fallback) |
| `POST` | `/api/campaigns` | Bulk schedule email campaign |
| `GET` | `/api/slack/oauth` | Slack OAuth authorization redirect |
| `GET` | `/api/slack/status` | Current Slack integration status |
| `DELETE` | `/api/slack/disconnect` | Disconnect Slack integration |

---

## 8. Feature Completion Checklist

- [x] **Monorepo setup with TypeScript** for both Frontend & Backend
- [x] **PostgreSQL & Prisma ORM** schema with User, ScheduledEmail, Campaign, SenderAccount, SlackIntegration
- [x] **BullMQ & Redis** delayed job scheduling
- [x] **Separate Background Worker** (`email.worker.ts`)
- [x] **Atomic Redis Hourly Rate Limiting** with Lua script
- [x] **Safe Rescheduling** when rate limit is exceeded (no dropped emails)
- [x] **Nodemailer + Ethereal SMTP** test delivery with preview URLs
- [x] **Elasticsearch Integration** with user data isolation & graceful fallback
- [x] **Bull Board** live visual queue monitoring at `/admin/queues`
- [x] **Slack OAuth & API Notifications** with 1-hour deduplication
- [x] **Google OAuth 2.0 & Instant Dev Mode**
- [x] **React + Tailwind Frontend** matching Figma specifications:
  - Google login & dev mode entry
  - User header with avatar & email
  - Scheduled and Sent tabs
  - Compose modal with CSV uploader & recipient detection
  - Delay & hourly limit controls
- [x] **Reconciliation recovery** for pending jobs after restart
