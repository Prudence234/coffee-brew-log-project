# Documentation

## Project overview
Coffee Brew Log is a full-stack application for recording coffee recipes. A user can create a brew, view the brew log, filter entries by method, edit an entry and delete an entry.

## Technology stack
- **Frontend:** React + Vite
- **CSS:** Bootstrap 5 with custom CSS
- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Database:** SQLite

The repository keeps the backend and frontend in separate `backend/` and `frontend/` folders as required by the assessment.

## Local setup
Requirements: Node.js 20+.

1. Clone the repository.
2. Create a `.env` file in the repository root using `.env.example` as a template.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate the Prisma client and apply migrations:
   ```bash
   npm run db:generate
   npm run db:deploy
   ```
5. For development, run the backend and frontend in separate terminals:
   ```bash
   npm run dev --workspace backend
   npm run dev --workspace frontend
   ```
6. Open `http://localhost:5173` in a browser.

## API endpoints
| Method | Endpoint | Purpose | Success |
|---|---|---|---|
| GET | `/api/brews` | Read all brews | 200 |
| GET | `/api/brews?method=V60` | Filter by brew method | 200 |
| POST | `/api/brews` | Create a brew | 201 |
| PUT | `/api/brews/:id` | Update a brew | 200 |
| DELETE | `/api/brews/:id` | Delete a brew | 200 |
| GET | `/api/health` | Health check | 200 |

## Validation and errors
The frontend prevents submission when required fields are blank. The backend also validates all supplied fields before saving:

- Name and method must be non-blank.
- Coffee grams must be a positive whole number.
- Water grams must be a positive whole number.
- Rating must be a whole number from 1 to 5.
- Invalid input returns HTTP 400.
- Updating or deleting a missing brew returns HTTP 404.
- Unexpected server/database errors return HTTP 500.

## Environment variables
Create a local `.env` file from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
PORT=5000
```

Do not commit `.env` or database files containing local data.

## Frontend behaviour
The page displays the required `Brews: {brewCount}` title, updates the count after create/edit/delete operations, and supports filtering by brew method. The form uses browser validation for required fields and the backend repeats validation for API safety. The layout uses Bootstrap responsive grid classes and custom CSS for mobile and desktop screens.

## Production
The React application is built with Vite. Express serves the generated `frontend/dist` directory in production, allowing the project to run as a single Render web service.
