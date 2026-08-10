# Deployment Guide

## Render
1. Connect this GitHub repository to Render.
2. Create a Node web service.
3. Build command: `npm install && npm run db:generate && npm run db:deploy && npm run build`
4. Start command: `npm start`
5. Set `DATABASE_URL` to `file:./dev.db` and choose Node 20 or newer.
6. After the deployment succeeds, copy the public Render URL into this file.

## Public URL
`ADD_RENDER_PUBLIC_URL_HERE`

## Note
SQLite storage on a free cloud web service can be ephemeral. For production persistence, use a hosted PostgreSQL database.
