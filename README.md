# NoTraffic

Assignment is split into two repos:

- `app/` - React TS, shadcn for primitive comps and TanStack Query for efficient queries and mutations.
- `api/` - NestJS with route versioning, persisted polygon storage (mock db file) and payload validations

## API

- `GET /v1/polygons`
- `POST /v1/polygons`
- `PATCH /v1/polygons/:polygonId`
- `DELETE /v1/polygons/:polygonId`

## Running

While in root directory, run the following:

- `npm run setup` to install the dependencies on both the /app and /api
- `npm run setup:env` to create `app/.env` and `api/.env` from the example files
- `npm run start` to start both the /app and /api

## Local Dev

- Web: `http://localhost:5173`
- API: `http://localhost:5001/api/v1/polygons`

## Environment files

- Vite reads `app/.env`
- Nest reads `api/.env` or `api/.env.local`
- `.env.example` files are templates and are not loaded automatically
