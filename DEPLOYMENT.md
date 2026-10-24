# Deployment Guide — ReachInbox Scheduler

ReachInbox Scheduler is a distributed system with four core components:
1. **Frontend**: React + Vite SPA
2. **Backend API**: Node.js + Express Web Server (hosts REST API and Bull Board monitor)
3. **Queue Worker**: BullMQ Background Worker process
4. **State Layer**: PostgreSQL (Prisma) and Redis (BullMQ queue & rate limiter)

---

## Option 1: Render (Recommended for Full Stack)

Render supports deploying databases, redis, web servers, and background workers in one repository using the included `render.yaml` blueprint.

### Quick Steps:
1. Push your repository to GitHub (`https://github.com/Ayush4242/Mailscheduler`).
2. Log into [Render.com](https://render.com) and click **New + &rarr; Blueprint**.
3. Select your `Mailscheduler` repository.
4. Render will automatically detect `render.yaml` and provision:
   * **Managed PostgreSQL** (`reachinbox-db`)
   * **Managed Redis** (`reachinbox-redis`)
   * **Web Service** (`reachinbox-api`)
   * **Background Worker** (`reachinbox-worker`)
5. Deploy!

### Frontend on Render / Vercel:
* **Root Directory**: `frontend`
* **Build Command**: `npm run build`
* **Output Directory**: `dist`
* **Environment Variable**: `VITE_API_URL` pointing to your deployed backend URL.

---

## Option 2: Railway (Alternative 1-Click)

1. Go to [Railway.app](https://railway.app) and create a **New Project**.
2. Add **PostgreSQL** and **Redis** from the database templates.
3. Add **GitHub Repo &rarr; Mailscheduler**:
   * Service 1 (API): Root directory `backend`, start command `npm run start`.
   * Service 2 (Worker): Root directory `backend`, start command `npm run start:worker`.
4. Link `DATABASE_URL`, `REDIS_HOST`, and `REDIS_PORT` between the services.

---

## Option 3: Docker Compose (Self-Hosted / VPS)

Run the entire cluster with a single command on any VPS or Linux host:

```bash
docker compose up -d
```

This starts PostgreSQL (port 5432), Redis (port 6379), and Elasticsearch (port 9200).

---

## Required Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | API Port | `5000` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://user:pass@host:5432/reachinbox` |
| `REDIS_HOST` | Redis Server Host | `localhost` or Cloud Redis Host |
| `REDIS_PORT` | Redis Port | `6379` |
| `REDIS_PASSWORD` | Redis Password (if secured) | `your_secret_password` |
| `JWT_SECRET` | Secret key for JWT session tokens | `32+ character random string` |
| `CLIENT_URL` | Deployed Frontend URL for CORS | `https://your-frontend.vercel.app` |
| `SLACK_BOT_TOKEN` | Optional: Slack Bot User Token | `xoxb-...` |
| `SLACK_CHANNEL_ID` | Optional: Default Slack Channel ID | `C0CBW...` |
