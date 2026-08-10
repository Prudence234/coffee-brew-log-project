# Coffee Brew Log

A full-stack Coffee Brew Log built for the XPL Full-stack Developer Bootcamp assessment.

## Features
- React frontend with Vite and Bootstrap responsive styling
- Express REST API
- Prisma ORM with SQLite
- Create, read, filter, update and delete brews
- Client-side and server-side validation
- Method filtering through `/api/brews?method=...`
- Production frontend served by Express for single-service deployment

## Run locally
Requirements: Node.js 20+.

```bash
npm install
npm run db:generate
npm run db:deploy
```

For development, run the backend and frontend in two terminals:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

On Windows, double-click `START_PROJECT.bat`.

## API
- `GET /api/brews`
- `GET /api/brews?method=V60`
- `POST /api/brews`
- `PUT /api/brews/:id`
- `DELETE /api/brews/:id`
- `GET /api/health`

## Example JSON
```json
{
  "name": "Morning V60",
  "method": "V60",
  "coffeeGrams": 20,
  "waterGrams": 300,
  "rating": 5
}
```
