# Documentation

## Overview
Coffee Brew Log lets a user record coffee recipes, view them, filter them by method, edit them and delete them.

## Stack
- React + Vite
- Bootstrap 5
- Express.js
- Prisma ORM
- SQLite

## API
- GET `/api/brews`
- GET `/api/brews?method=V60`
- POST `/api/brews`
- PUT `/api/brews/:id`
- DELETE `/api/brews/:id`
- GET `/api/health`

## Validation
Name and method are required. Coffee and water grams must be positive whole numbers. Rating must be an integer from 1 to 5. Invalid input returns HTTP 400 and missing records return HTTP 404.

## Environment variables
`DATABASE_URL` controls the Prisma SQLite database path and `PORT` controls the Express port. Do not commit local `.env` files.

## Deployment
The app can be deployed as a single Node web service after the React build. Express serves `frontend/dist` in production.
