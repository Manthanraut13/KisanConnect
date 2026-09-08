# Other Services Notes - ai-service, Database, Jobs, Notifications

Companion to `documentation.md`. Covers everything that is neither the
Node backend nor the React frontend.

## ai-service (Python FastAPI, port 8000)

AI microservice for chatbot, pricing, forecasting and logistics AI.

### Layout

```
ai-service/
  run.py              Entry point (uvicorn)
  requirements.txt    Python deps
  railway.json        Railway deployment config
  .env.example        Env template (copy to .env, fill API keys)
  generate_data.py    Generate/sample dataset scripts
  create_notebooks.py Model dev notebooks
  test_live_server.py Smoke test against running server
  app/
    routes/           HTTP endpoints
      chatbot.py      Chat + multilingual/voice handling
      forecast.py     Demand forecasts
      logistics.py    Route optimization
      pricing.py      Price recommendations
    models/           Scikit-learn based ML models
      demand_forecaster.py, price_recommender.py, route_optimizer.py
    utils/            data_loader, geocoder, voice_engine, response helpers
    data/             Sample data: agmarknet_sample.csv, district_coords.json
  notebooks/          Jupyter notebooks for training/eval
  tests/              Python tests
```

### How to work on it

- Run: `cd ai-service && pip install -r requirements.txt && python run.py`
- Verify: `python test_live_server.py`
- Env: copy `.env.example` -> `.env`; keys must match what the backend
  `ai.service.js` (frontend) expects when calling your endpoints.
- Deployed on Railway via `railway.json`; keep dependencies pinned in
  `requirements.txt`.
- See `docs/SIDDHESH_AI_SERVICE_COMPLETE_GUIDE.md` for the deep dive.

## database/

### seed.js

Creates the full prototype dataset: predefined users (admin
`9876543210/Admin@123`, farmers, logistics partners, consumers), role
profiles, listings, orders, grievances, assignments, notifications.

- Run: `cd backend && npm run seed` (uses backend ORM + env).
- Idempotent-ish: it upserts known accounts; keep it stable because DPRs and
  demo accounts depend on it.
- Demo accounts used by prior testing live here (`9797979797/Driver@1234`
  driver, `9898989898/Test@1234` farmer).

Schema is created by Sequelize (`sync({ alter: true })` in dev) - there is
no separate migration set that the app relies on at startup.

## Jobs (backend/src/jobs/cron.js)

- `initJobs()` started from `server.js`.
- node-cron scheduled tasks: forecast refresh, pending-order / SLA
  notifications. If a job fails, it logs via `utils/logger.js` and schedules
  the next run; inspect logs rather than restarting the whole server.

## Notifications

`backend/src/services/notification.service.js` exposes `sendSMS`, `sendEmail`,
`sendPush`; every send is recorded in the `NotificationLog` model. Used by:

- Admin user deactivation SMS
- Order placed / status change
- Grievance SLA reminders (cron)
- Admin broadcast (`POST /api/admin/notifications/broadcast`)

External providers are wired through configs (firebase for push, SMS provider
in env). In development, SMS/email calls fail softly (logged) so they do not
block the request flow.

## Webhooks

`backend/src/routes/webhook.routes.js` are used by the ai-service and by
internal processes (forecast refresh, order placed, new grievance, generic
log). If you add a new cross-service event, add it here instead of coupling
services directly.

## .github / CI

Repo has GitHub Actions / Workflow for PR checks. Push to a `feature/*`
branch and open a PR; do not push directly to `main`. See
`GITHUB_GUIDE_TEAM.md` for the team git workflow.