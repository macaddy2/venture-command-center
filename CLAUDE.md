# CLAUDE.md — Venture Command Center

This file provides guidance for AI assistants working on this codebase.

## Project Overview

Venture Command Center is a multi-venture portfolio management dashboard for managing multiple startups simultaneously. It tracks tasks, financials, risks, team roles, milestones, documents, and health metrics across a portfolio of ventures.

**Key design principles:**
- **Local-first**: All data persists in localStorage by default; works fully offline
- **Cloud-optional**: Supabase integration for bidirectional sync when configured
- **AI-enhanced**: Optional OpenAI integration for copilot chat and insights

## Tech Stack

- **React 19** with TypeScript (strict mode)
- **Vite 7** for dev server and bundling
- **Framer Motion** for animations
- **Recharts** for data visualization (bar, pie, area charts)
- **Lucide React** for icons
- **Supabase** for optional backend/realtime sync
- **UUID** for ID generation

No CSS framework (Tailwind, etc.) — uses custom CSS with CSS variables and inline styles.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build (tsc && vite build)
npm run lint       # ESLint with zero-warning policy (--max-warnings 0)
npm run preview    # Preview production build locally
```

There are no tests configured in this project.

## Project Structure

```
src/
├── App.tsx                  # Main app shell, view router (switch on activeView)
├── main.tsx                 # React entry point (StrictMode + ThemeProvider + App)
├── index.css                # Global styles, CSS variables, design system
├── components/              # 22 feature view components
│   ├── Dashboard.tsx        # Portfolio overview with KPI cards, venture grid
│   ├── KanbanBoard.tsx      # 6-column task board (backlog→done+blocked)
│   ├── Analytics.tsx        # Charts: task distribution, health, velocity
│   ├── AICopilot.tsx        # Chat interface + NLP command parser (largest component)
│   ├── FocusMode.tsx        # Daily sprint planner with timer
│   ├── TimelineView.tsx     # Gantt-style milestone timeline
│   ├── FinancialTracker.tsx # Revenue/expense/funding tracking
│   ├── RiskMatrix.tsx       # 5x5 impact/likelihood grid
│   ├── SettingsView.tsx     # App configuration
│   ├── RecurringTasks.tsx   # Daily/weekly/monthly task generation
│   ├── DocumentVault.tsx    # Document storage by category
│   ├── ResourceSharing.tsx  # Cross-venture resource allocation
│   ├── PredictiveAlerts.tsx # Proactive warning system
│   ├── VentureComparisons.tsx # Cross-venture metrics comparison
│   ├── WeeklyDigest.tsx     # Auto-generated portfolio summary
│   ├── StandupGenerator.tsx # Meeting prep from task data
│   ├── DetailPanel.tsx      # Right sidebar for venture details
│   ├── VentureCard.tsx      # Dashboard grid card with health gauge
│   ├── TaskForm.tsx         # Create/edit task modal
│   ├── Header.tsx           # Top nav, search, theme toggle
│   └── Sidebar.tsx          # Left navigation + venture list
├── lib/                     # Core logic and state
│   ├── types.ts             # All TypeScript interfaces and type aliases
│   ├── store.tsx            # React Context + useReducer (central state management)
│   ├── utils.ts             # Health score calculation, formatters, color palettes
│   ├── seed-data.ts         # 10 seed ventures + 100+ sample tasks
│   ├── supabase.ts          # Supabase client initialization
│   ├── openai.ts            # OpenAI chat completion + streaming
│   ├── github.ts            # GitHub API integration
│   └── theme.tsx            # Dark/light mode context
├── hooks/                   # Custom React hooks
│   ├── useSupabaseSync.ts   # Realtime bidirectional data sync
│   └── useGitHub.ts         # GitHub stats fetching
supabase/
└── schema.sql               # Full Supabase SQL schema (13 tables)
```

## Architecture

### State Management

Uses **React Context + useReducer** (not Redux). Single centralized state in `src/lib/store.tsx`.

- **State shape**: 13 entity collections (ventures, tasks, milestones, teamRoles, registrations, githubStats, aiInsights, healthSnapshots, recurringTasks, financials, documents, risks, resourceSharing) plus UI state (filters, selectedVentureId, activeView, sidebarCollapsed, isLoading)
- **Actions**: ~40 action types following the pattern `SET_X`, `ADD_X`, `UPDATE_X`, `DELETE_X`
- **Persistence**: Auto-saves entity data to localStorage under key `vcc-state` on every state change
- **Initialization**: Falls back to seed data from `seed-data.ts` when localStorage is empty
- **Access**: All components use `const { state, dispatch, ...helpers } = useStore()`

### Computed Values

The store exposes computed selectors (recalculated on render):
- `venturesWithStats` — ventures enriched with task/team/milestone summaries and health scores
- `filteredVentures` — applies tier/geo/search filters
- `selectedVenture` — the currently selected venture with full stats
- `portfolioStats` — aggregated KPIs across all ventures

### View Routing

No URL-based routing. Views are switched via context state:

```typescript
dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'dashboard' | 'tasks' | 'analytics' | ... })
```

16 views total: `dashboard`, `tasks`, `analytics`, `ai`, `settings`, `timeline`, `focus`, `financials`, `documents`, `risks`, `comparisons`, `digest`, `recurring`, `resources`, `alerts`, `standup`.

The `App.tsx` `renderView()` function maps `activeView` to the corresponding component via a switch statement.

### Styling

- **CSS variables** defined in `index.css` for colors, spacing, typography, shadows, radii, transitions
- **Dark/light theme** via `[data-theme="dark|light"]` attribute on `<html>`, managed by `ThemeProvider`
- **Hybrid approach**: CSS classes for reusable patterns + inline styles for dynamic values (venture colors, etc.)
- **Font**: Inter (loaded from Google Fonts)
- **Animations**: Framer Motion `motion.div` wrappers with `initial/animate/exit` props
- **No utility CSS framework** — all custom CSS

### External Integrations (all optional)

Configured via environment variables (see `.env.example`):

| Integration | Env Vars | Purpose |
|---|---|---|
| Supabase | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Database + realtime sync |
| GitHub | `VITE_GITHUB_TOKEN` | Repo/commit/PR stats per venture |
| OpenAI | `VITE_OPENAI_API_KEY`, `VITE_OPENAI_MODEL` | AI Copilot chat + insights |

All integrations degrade gracefully — the app runs fully in local-only mode without any env vars.

## Key Types

Defined in `src/lib/types.ts`:

**Enums:**
- `VentureTier`: `'Active Build' | 'Incubating' | 'Parked'`
- `VentureGeo`: `'UK' | 'NG'`
- `TaskStatus`: `'backlog' | 'todo' | 'in-progress' | 'review' | 'done' | 'blocked'`
- `TaskPriority`: `'P0' | 'P1' | 'P2' | 'P3'`
- `ViewKey`: 16 string literals for view routing

**Core entities:** `Venture`, `Task`, `Milestone`, `TeamRole`, `Registration`, `GitHubStats`, `AIInsight`, `HealthSnapshot`, `RecurringTask`, `FinancialRecord`, `VentureDocument`, `Risk`, `ResourceSharing`

## Conventions

### Code Style
- TypeScript strict mode — all code must type-check (`tsc` runs before build)
- ESLint zero-warning policy — `--max-warnings 0`
- Unused variables prefixed with `_` are allowed (`@typescript-eslint/no-unused-vars` configured with `argsIgnorePattern: '^_'`)
- `no-console` is set to warn — avoid `console.log` in production code
- `@typescript-eslint/no-explicit-any` is set to warn — prefer typed alternatives
- `prefer-const` enforced

### Component Patterns
- Components are default-exported function components
- State access: `const { state, dispatch, addTask, updateTask, ... } = useStore()`
- Animations: wrap top-level component element with `motion.div` using `initial={{ opacity: 0, y: 12 }}` and `animate={{ opacity: 1, y: 0 }}`
- Icons: import from `lucide-react`
- IDs: generated via `generateId()` from `lib/utils.ts` (wraps `crypto.randomUUID()`)

### Adding a New Entity
1. Define the interface in `src/lib/types.ts`
2. Add action types to the `Action` union in `src/lib/store.tsx`
3. Add reducer cases in the `reducer` function
4. Add to `AppState` interface and `getInitialState()`
5. Add to `saveToStorage()` serialization
6. Optionally add seed data in `src/lib/seed-data.ts`
7. Optionally add Supabase table in `supabase/schema.sql` and sync mapping in `useSupabaseSync.ts`

### Adding a New View
1. Create component in `src/components/`
2. Add the view key to `ViewKey` type in `src/lib/types.ts`
3. Add the case to `renderView()` switch in `src/App.tsx`
4. Add navigation item to `src/components/Sidebar.tsx`
5. Import the component in `src/App.tsx`

### Health Score Formula
Weighted computation in `src/lib/utils.ts:computeHealthScore()`:
- 30% task velocity (done / total)
- 20% blocker penalty
- 20% team coverage (filled / total roles)
- 20% milestone progress (average completion)
- 10% registration completion

## Database Schema

The Supabase schema (`supabase/schema.sql`) defines 13 tables mirroring the client-side entities. All tables use UUID primary keys with `gen_random_uuid()` defaults and `TIMESTAMPTZ` timestamps. Foreign keys cascade on delete from the ventures table.

## Environment Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in desired values (all optional)
3. `npm run dev` to start development
4. If using Supabase, run `supabase/schema.sql` in the Supabase SQL editor
