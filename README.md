# Summary

Assignment is a monorepo which consists of two projects:

- `app/` - React TS, shadcn for primitive comps and TanStack Query for efficient queries and mutations.
- `api/` - NestJS with route versioning, persisted polygon storage (mock db file) and payload validations

## Install & Startup

While in root directory, run the following:

- `npm run setup` to install the dependencies on both the /app and /api
- `npm run start` to start both the /app and /api

## Tests

- API: `npm --prefix api test`
- UI: `npm --prefix app test`

## Local Development

- Web: `http://localhost:5173`
- API: `http://localhost:5001/v1/polygons`

## API Docker

- Build and run: `docker compose up --build api`
- The container exposes the API at `http://localhost:5001/v1/polygons`
- Polygon data is persisted in the Docker volume `api-data`
