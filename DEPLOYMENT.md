# Production Deployment Guide

This guide walks through deploying Reward Hunter to production.

Recommended stack:
- **Frontend** — Vercel (Vite static + edge)
- **Backend** — Render (Docker, NestJS)
- **Database** — MongoDB Atlas (M10 cluster)
- **Email** — Resend
- **Monitoring** — Sentry + UptimeRobot

Estimated monthly cost (50-200 users): **~$65-130/month**.

---

## 1. Pre-flight checklist

Before pushing to production, confirm:

- [ ] All tests pass: `cd backend && npm test`, `npm test` at repo root.
- [ ] Frontend builds: `npm run build`.
- [ ] Backend builds: `cd backend && npm run build`.
- [ ] No secrets in `.env*` committed to git (`.gitignore` covers `.env`).
- [ ] `JWT_SECRET` generated with `openssl rand -base64 64`.
- [ ] CORS origins reflect the real frontend URL.

---

## 2. MongoDB Atlas

1. Create an **M10** cluster (production tier) — M0 free tier has no backups.
2. Region: choose closest to backend host (e.g. Singapore for Render Singapore).
3. Whitelist the backend host IP (Render outbound IPs are documented per region).
4. Create a database user with `readWrite` on `reward_hunter_prod`.
5. Enable scheduled snapshots (every 6h, retain 7 days).
6. Copy the connection string for `DATABASE_URL`.

After creating the cluster, push the Prisma schema:

```bash
cd backend
DATABASE_URL='mongodb+srv://...' npx prisma db push
```

---

## 3. Backend on Render

The `backend/render.yaml` blueprint is provided. To deploy:

1. Push this repo to GitHub (already on `main`).
2. In Render: **New + → Blueprint → connect this repo**.
3. Render picks up `backend/render.yaml` automatically.
4. Set these secrets in the Render dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Atlas connection string |
| `JWT_SECRET` | `openssl rand -base64 64` output |
| `RESEND_API_KEY` | From [resend.com](https://resend.com) |
| `CORS_ORIGINS` | `https://rewardshunter.vercel.app,https://<your-domain>` |

5. First deploy will take ~5 minutes.
6. Verify: `curl https://<your-service>.onrender.com/health` → returns `{"status":"ok",...}`.

---

## 4. Frontend on Vercel

`vercel.json` is configured at repo root. To deploy:

1. In Vercel: **Add New → Project → import this repo**.
2. Framework preset: **Vite** (auto-detected).
3. Add environment variables:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-service>.onrender.com/api` |
| `VITE_APP_ENV` | `production` |
| `VITE_SENTRY_DSN` | (optional) |

4. Deploy. Vercel will assign `rewardshunter-xxx.vercel.app`.
5. Add your custom domain in **Settings → Domains**.
6. After domain is live, add it to backend `CORS_ORIGINS` and redeploy.

---

## 5. Monitoring (recommended)

### Sentry
- Frontend: install `@sentry/react` and configure with `VITE_SENTRY_DSN`.
- Backend: install `@sentry/node` and wrap `main.ts`.
- Free tier: 5k errors/month.

### UptimeRobot
- Monitor: `https://<api>/health` every 5 minutes.
- Alert: email + SMS on downtime.

### MongoDB Atlas Charts
- Built-in dashboards for slow queries, connection count, storage.

---

## 6. Rollback procedure

Test this BEFORE you need it.

```bash
# Frontend rollback
vercel rollback <deployment-url>

# Backend rollback
# Render dashboard → Deploys → click previous green deploy → Redeploy

# Database rollback (only for data corruption)
# Atlas → Backup → Restore from snapshot (15-30 minutes)
```

---

## 7. Post-launch monitoring (first 48h)

Watch these metrics every 4 hours:

- Error rate < 0.5% (Sentry).
- p95 response time < 500ms (Render metrics).
- DB connection count < 80% of cluster limit (Atlas).
- 0 OTP send failures (Resend dashboard).
- DAU growing as expected.

If any threshold is breached, follow rollback procedure above.

---

## 8. Security hardening checklist

Already enforced by code:
- [x] `helmet` security headers
- [x] Strict CORS via `CORS_ORIGINS` env var
- [x] JWT secret length enforced at boot (refuses to start with weak secret in prod)
- [x] DTO validation with `forbidNonWhitelisted`
- [x] Per-endpoint throttling on auth (OTP, login, register)
- [x] Body size limit (200 KB)
- [x] bcrypt password hashing
- [x] HTTPS via Vercel + Render (automatic)
- [x] HSTS header on frontend

Operator responsibilities:
- [ ] Use unique strong `JWT_SECRET` per environment
- [ ] Rotate `JWT_SECRET` every 90 days (will invalidate all sessions)
- [ ] Enable MFA on Render, Vercel, Atlas, Resend accounts
- [ ] Restrict Atlas IP whitelist to backend IPs only
- [ ] Review Resend "From" address — use a domain you control once verified
