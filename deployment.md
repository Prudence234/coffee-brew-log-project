# Deployment Guide

## Render deployment
This project is deployed as a Node web service on Render.

- **Repository:** `Prudence234/coffee-brew-log-project`
- **Branch:** `main`
- **Build command:** `npm install && npm run db:generate && npm run db:deploy && npm run build`
- **Start command:** `npm start`
- **Node:** 20+
- **Database:** SQLite through Prisma

## Public URL
https://coffee-brew-log-project-1.onrender.com

## Verification
The deployed service exposes:

- `GET /` — confirms the Coffee Brew API is running.
- `GET /api/health` — API health check.
- `GET /api/brews` — brew log endpoint.

The frontend is served by Express after the Vite production build.

## Troubleshooting notes
The project was initially checked against the GitHub Classroom repository, but the deployed Render service was connected to `Prudence234/coffee-brew-log-project`. The Render service is configured to deploy the `main` branch and start with `npm start`.

SQLite on a free cloud web service may use ephemeral storage. For a production application requiring durable data, a hosted PostgreSQL database should be used instead.
