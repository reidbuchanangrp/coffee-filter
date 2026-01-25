# CoffeeFilter: A Deep Dive

*A specialty coffee shop discovery app - and the engineering lessons learned building it.*

---

## The Big Picture

Imagine you're new to Kansas City and desperately need good coffee. Not Starbucks - *real* coffee. Pour-over, single-origin, the kind made by someone with a beard and strong opinions about water temperature. CoffeeFilter solves this problem with an interactive map that shows you exactly where to find your next caffeine fix.

But under the hood, it's actually two separate applications talking to each other - like a restaurant where the kitchen (backend) and the dining room (frontend) operate independently but need to stay perfectly synchronized.

---

## The Architecture: A Tale of Two Apps

### The Frontend (React Router + Vite)

The frontend lives in `/coffee-filter-ui/` and is built with **React Router v7** - not Next.js, which is worth noting. React Router v7 brought file-based routing similar to Next.js, but runs on Vite, which means blazing fast hot module replacement during development.

**Why React Router instead of Next.js?** This app doesn't need the heavy SSR machinery Next.js provides. It's primarily a client-side interactive map. React Router gives us the routing we need without the complexity overhead.

The component hierarchy looks like this:

```
root.tsx (AuthProvider wraps everything)
  └── home.tsx (the main event)
        ├── CoffeeShopMap (dynamic import - SSR-safe wrapper)
        │     └── CoffeeShopMapClient (the actual Leaflet map)
        ├── CoffeeShopDetailPanel (slide-in panel when you click a shop)
        └── AddCoffeeShopDialog / EditCoffeeShopDialog (lazy-loaded, admin only)
```

### The Backend (FastAPI + SQLAlchemy)

The backend in `/backend/` is a Python FastAPI application. FastAPI was chosen because:
1. It's *fast* (async by default)
2. Automatic OpenAPI documentation
3. Pydantic validation means fewer runtime surprises
4. Python is great for the geocoding/data processing we do

The backend handles CRUD operations for coffee shops, user authentication (JWT), and auto-geocoding addresses using OpenStreetMap's Nominatim API.

---

## The Tricky Parts (And How We Solved Them)

### Problem 1: Leaflet Hates SSR

Leaflet, our mapping library, touches the `window` object on import. Server-side rendering has no `window`. This causes the dreaded "window is not defined" error that has ruined many developers' afternoons.

**The Fix:** Dynamic imports with SSR disabled.

```tsx
// CoffeeShopMap.tsx - the SSR-safe wrapper
const CoffeeShopMapClient = dynamic(
  () => import('./CoffeeShopMapClient'),
  { ssr: false }
);
```

The map component is only imported on the client. The server renders a placeholder, hydration takes over, and the map loads. Crisis averted.

### Problem 2: URL State Synchronization

Users expect to share links. If I'm looking at "Messenger Coffee" zoomed in at a specific location, the URL should capture that. When someone opens my link, they should see exactly what I see.

**The Solution:** We serialize map state to URL params:
- `?view=39.0558,-94.5889,15` (lat, lng, zoom)
- `?shop=42-messenger-coffee` (selected shop ID + slug)

The tricky part was making this *not* fight with React's state management. We use `useSearchParams` from React Router and carefully debounce map movements (500ms) so we're not hammering the URL on every pixel of pan.

```tsx
// Debounced to avoid URL spam while dragging
const handleMoveEnd = () => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    const center = map.getCenter();
    onViewChange(center.lat, center.lng, map.getZoom());
  }, 500);
};
```

### Problem 3: The O(n) Lookup Trap

Every time someone clicked a shop or navigated back/forward, we were doing:
```tsx
coffeeShops.find(s => s.id === shopId)  // O(n) every time!
```

With 50 shops, no big deal. With 500? You'd feel it. With 5000? Pain.

**The Fix:** Build a lookup Map once, use O(1) lookups forever:

```tsx
const shopById = useMemo(
  () => new Map(coffeeShops.map(shop => [shop.id, shop])),
  [coffeeShops]
);

// Later: O(1) instead of O(n)
const shop = shopById.get(shopId);
```

This is a classic performance pattern: trade memory for speed. The Map costs us a few KB of RAM but makes every lookup instant.

### Problem 4: Bundle Size for Non-Admins

Most users will never add or edit a coffee shop - that's admin-only. But we were shipping `AddCoffeeShopDialog` and `EditCoffeeShopDialog` to everyone, adding ~30KB to the initial bundle.

**The Fix:** Lazy loading with React's `lazy()`:

```tsx
const AddCoffeeShopDialog = lazy(() =>
  import("../components/AddCoffeeShopDialog").then(m => ({
    default: m.AddCoffeeShopDialog,
  }))
);
```

Now these components only load when an admin actually needs them. Regular users never download the code.

---

## The Data Flow: Following a Coffee Shop

Let's trace what happens when someone clicks a marker on the map:

1. **Click event** fires on the Leaflet marker
2. `onMarkerClick(shop)` callback triggers
3. `handleSelectShop` updates both React state AND URL params
4. URL change triggers `useEffect` that syncs `selectedShop` state
5. `CoffeeShopDetailPanel` renders with the selected shop
6. If user hits browser back, URL changes, effect runs, panel closes

This bidirectional sync (state ↔ URL) is what makes the back button work correctly. It's also what makes it tricky - you have to be careful not to create infinite loops where state changes URL changes state changes URL...

---

## Data Transformation: The snake_case/camelCase Dance

Python (backend) uses `snake_case`. JavaScript (frontend) uses `camelCase`. This isn't just style - it's convention enforced by linters on both sides.

We handle this with transform functions in `api.ts`:

```tsx
function transformToFrontend(backendShop: any): CoffeeShop {
  return {
    hasWifi: backendShop.has_wifi,      // snake → camel
    pourOver: backendShop.pour_over,
    weeklyHours: backendShop.weekly_hours,
    // ... etc
  };
}
```

**Lesson learned:** Define this transformation layer early. If you start with inconsistent casing, you'll be hunting down bugs for weeks ("why is `hasWifi` undefined? Oh, the backend calls it `has_wifi`...").

---

## Performance Patterns We Use

| Pattern | Where | Why |
|---------|-------|-----|
| `useMemo` | Shop filtering, Map lookups | Avoid recalculating on every render |
| `useCallback` | Event handlers | Stable references for child components |
| `memo()` | PopupContent component | Skip re-render if props unchanged |
| Module-level icons | CoffeeShopMapClient | Create Leaflet icons once, reuse forever |
| Debouncing | Map view changes | Don't spam URL updates while panning |
| Lazy loading | Admin dialogs | Don't ship code users won't use |

---

## Lessons for Future Projects

1. **URL state is powerful but tricky.** It makes sharing and back-button work great, but you need to carefully manage the state ↔ URL sync to avoid loops.

2. **Build lookup Maps early.** If you're going to `.find()` in an array more than once by the same key, build a Map. It's almost always worth it.

3. **Lazy load aggressively.** Any component that's conditional (admin-only, behind a modal, below the fold) is a candidate for lazy loading.

4. **Define your data transformation layer.** Backend and frontend will have different conventions. Centralize the translation.

5. **Debounce user-driven events.** Map panning, typing in search boxes, window resizing - if it fires rapidly, debounce it before doing expensive work.

6. **Pre-create expensive objects.** Leaflet icons, compiled regexes, formatted dates - if you're creating the same thing repeatedly, hoist it to module level.

---

## What's Next?

Potential improvements to explore:
- **SWR or React Query** for data fetching (automatic caching, revalidation)
- **Service Worker** for offline support (view cached shops without network)
- **Image optimization** with blur placeholders while loading
- **Virtual scrolling** if the shop list gets very long

---

*Last updated: January 2025 - Performance optimizations (lazy loading, Map lookups)*
