# NoTraffic

Assignment is split into two repos:

- `app/` - React TS, shadcn for primitive comps and TanStack Query for efficient queries and mutations.
- `api/` - NestJS with route versioning, persisted polygon storage (mock db file) and payload validations

## API

- `GET /api/v1/polygons`
- `POST /api/v1/polygons`
- `PATCH /api/v1/polygons/:polygonId`
- `DELETE /api/v1/polygons/:polygonId`

## Local Dev

- Web: `http://127.0.0.1:5173/`
- API: `http://127.0.0.1:5001/api/v1/polygons`

## Running

While in root, run `npm run start` to initialize both the frontend and the backend.
