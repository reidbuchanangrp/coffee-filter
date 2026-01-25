# Coffee Filter - Project Context

## Overview

Coffee Filter is a full-stack web application for discovering and managing local coffee shops. Users can browse shops on an interactive map, view amenities and hours, and filter by criteria like "currently open." Admins can add, edit, and delete shops.

## Tech Stack

### Frontend (`coffee-filter-ui/`)
- **Framework**: React Router v7 with SSR
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **UI Components**: Radix UI (shadcn/ui style)
- **Maps**: Leaflet + React Leaflet with marker clustering
- **Build**: Vite

### Backend (`backend/`)
- **Framework**: FastAPI
- **Language**: Python
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL (production) / SQLite (development)
- **Validation**: Pydantic v2
- **Auth**: JWT with OAuth2 password flow

## Project Structure

```
coffee-filter/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (coffee_shops.py, auth.py)
│   │   ├── core/             # Database, auth, geocoding utilities
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── main.py           # FastAPI app entry point
│   ├── requirements.txt
│   └── seed_data.py          # Database seeding script
│
├── coffee-filter-ui/
│   ├── app/
│   │   ├── routes/           # Page components (home.tsx, about.tsx)
│   │   ├── components/       # React components
│   │   │   ├── ui/           # Base Radix UI components
│   │   │   └── *.tsx         # Feature components
│   │   └── lib/              # Utilities, types, API client
│   ├── package.json
│   └── vite.config.ts
│
└── docker-compose.yml        # Development environment
```

## Key Conventions

### Field Naming
- **Backend (Python)**: `snake_case` - e.g., `has_wifi`, `weekly_hours`
- **Frontend (TypeScript)**: `camelCase` - e.g., `hasWifi`, `weeklyHours`
- The API client (`lib/api.ts`) handles transformations automatically

### API Endpoints
Base path: `/api/v1`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/coffee-shops` | List all shops | No |
| GET | `/coffee-shops/{id}` | Get single shop | No |
| POST | `/coffee-shops` | Create shop | Yes |
| PUT | `/coffee-shops/{id}` | Update shop | Yes |
| DELETE | `/coffee-shops/{id}` | Delete shop | Yes |
| POST | `/auth/login` | Admin login | No |

### Coffee Shop Model Fields
- `name`, `address`, `latitude`, `longitude`
- `image` (Cloudinary URL)
- `hasWifi`, `accessibility` (booleans)
- `weeklyHours` (JSON: `{monday: {open: "07:00", close: "17:00"}, ...}`)
- `pourOver`, `machine`, `description`
- `website`, `instagram`
- `starred` (featured shops)

### Component Patterns
- Dialog components use Radix UI Dialog primitives
- Form state managed with React useState
- Map state persisted in URL query params (`view`, `zoom`, `shop`)
- Auth state via React Context (`AuthContext.tsx`)

## Common Development Tasks

### Adding a New Coffee Shop Field
1. Add to SQLAlchemy model (`backend/app/models/coffee_shop.py`)
2. Add to Pydantic schemas (`backend/app/schemas/coffee_shop.py`)
3. Add to TypeScript interface (`coffee-filter-ui/app/lib/types.ts`)
4. Update API transformation functions (`coffee-filter-ui/app/lib/api.ts`)
5. Update relevant components (Add/Edit dialogs, DetailPanel)

### Running Locally
```bash
# Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd coffee-filter-ui && npm run dev
```

### Docker Development
```bash
docker-compose up
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
```

## Important Files

- `coffee-filter-ui/app/routes/home.tsx` - Main app page with map and shop list
- `coffee-filter-ui/app/lib/api.ts` - API client with snake_case/camelCase transforms
- `coffee-filter-ui/app/lib/types.ts` - TypeScript interfaces
- `backend/app/api/v1/coffee_shops.py` - CRUD endpoints
- `backend/app/models/coffee_shop.py` - Database model
- `backend/app/schemas/coffee_shop.py` - Request/response schemas

## Documentation Practice

For every project, write a detailed `FOR[yourname].md` file that explains the whole project in plain language.

**What to include:**

- **Technical Architecture**: How the system is designed and why. Explain the frontend/backend split, how data flows, and the mental model behind it.

- **Codebase Structure**: How the various parts connect. Don't just list folders—explain the relationships. Why does the API client live in `lib/`? How do components talk to the backend?

- **Technology Choices**: What we're using and *why we chose it*. React Router for SSR capabilities, FastAPI for speed and type safety, Leaflet because it's lightweight and open-source.

- **Lessons Learned**: This is the gold. Document:
  - Bugs encountered and how they were fixed (e.g., "Map markers weren't updating because React was memoizing stale coordinates")
  - Potential pitfalls and how to avoid them (e.g., "Always transform snake_case to camelCase at the API boundary, not in components")
  - New technologies explored and what made them click
  - Patterns that good engineers use and why they work
  - Best practices discovered through trial and error

**Writing style:**

Make it engaging—not a boring textbook. Use analogies ("The API client is like a translator at the border between two countries with different languages"). Include anecdotes ("We spent 3 hours debugging why shops weren't showing up, only to realize the coordinates were swapped"). Write it like you're explaining to a smart friend who's new to the codebase.

The goal: Future you (or anyone reading it) should genuinely enjoy learning from it and walk away with real understanding, not just information.

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Default admin credentials

### Frontend
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:8000`)
