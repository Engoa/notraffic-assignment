# Summary

Assignment is a monorepo which consists of two projects:

- `app/` - React TS, shadcn for primitive comps and TanStack Query for efficient queries and mutations.
- `api/` - NestJS with route versioning, persisted polygon storage (mock db file) and payload validations

## Install & Startup

While in root directory, run the following:

- `npm run setup` to install the dependencies on both the /app and /api
- `npm run start` to start both the /app and /api

## Local Development

- Web: `http://localhost:5173`
- API: `http://localhost:5001/api/v1/polygons`
