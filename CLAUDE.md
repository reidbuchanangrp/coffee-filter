# CoffeeFilter - Project Context for Claude

## Project Overview

CoffeeFilter is a coffee shop discovery platform for finding specialty coffee shops in Kansas City. It features an interactive map with filtering, admin CMS capabilities, and detailed shop information.

## Tech Stack

**Frontend:** React Router v7 + Vite + TypeScript + Tailwind CSS v4 + Radix UI
**Backend:** FastAPI + SQLAlchemy + SQLite/PostgreSQL
**Map:** Leaflet + react-leaflet with marker clustering

## Project Structure

```
/coffee-filter-ui/          # Frontend (React Router)
├── app/
│   ├── routes/home.tsx     # Main map page with shop management
│   ├── components/         # UI components
│   ├── lib/                # API client, types, auth context
│   └── root.tsx            # Root layout with Auth provider
└── vite.config.ts

/backend/                   # FastAPI Backend
├── app/
│   ├── api/v1/             # REST endpoints
│   ├── models/             # SQLAlchemy models
│   ├── schemas/            # Pydantic schemas
│   └── core/               # Database, auth, geocoding
└── requirements.txt
```

## Key Patterns

- **SSR-safe map loading**: Map component dynamically imported to avoid Leaflet SSR issues
- **URL state sync**: Map view (center + zoom) and selected shop persisted in URL params
- **Admin-only lazy loading**: AddCoffeeShopDialog and EditCoffeeShopDialog are lazy-loaded
- **Memoization**: Shop lookup Map, filtered shops, and callbacks are memoized
- **Data transformation**: snake_case (backend) ↔ camelCase (frontend) via transform functions

## API Base URL

Development: `http://localhost:8000/api/v1`
Production: Set via `VITE_API_URL` environment variable

## Authentication

JWT-based auth stored in localStorage. Admin users can create/edit/delete shops.

## Commands

```bash
# Frontend
cd coffee-filter-ui && npm run dev

# Backend
cd backend && uvicorn app.main:app --reload
```

---

## Documentation Preference

When significant work is done on this project, update `COFFEEFILTER.md` with explanations of:
- The technical architecture and how the various parts connect
- Technologies used and why we made these technical decisions
- Bugs encountered and how they were fixed
- Potential pitfalls and how to avoid them
- Lessons learned and best practices

Write it engagingly - use analogies and anecdotes, not dry technical documentation.
