# Venture Command Center

## Project Overview

A React-based portfolio management dashboard for tracking multiple ventures (startups/projects). Provides task management, financial tracking, risk analysis, AI copilot, GitHub integration, and more across a multi-venture portfolio.

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9 (strict mode)
- **Build**: Vite 7.3 (`@vitejs/plugin-react`)
- **State**: React Context + `useReducer` (local-first with localStorage persistence)
- **Styling**: CSS custom properties (no CSS-in-JS library), `index.css` + `style.css`
- **Charts**: Recharts 3
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Backend (optional)**: Supabase (configured via `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars)
- **AI (optional)**: OpenAI API (key stored in localStorage)
- **GitHub (optional)**: GitHub token for repo stats sync (key stored in localStorage)

## Commands

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # TypeScript check + Vite production build (tsc && vite build)
npm run lint       # ESLint with zero warnings tolerance (--max-warnings 0)
npm run preview    # Preview production build (port 4173)
```

## Project Structure

```
src/
├── App.tsx                    # Main app shell, routing between views
├── main.tsx                   # React entry point
├── index.css / style.css      # Global styles using CSS custom properties
├── components/                # All UI views (20 components)
│   ├── Dashboard.tsx          # Main portfolio overview
│   ├── KanbanBoard.tsx        # Task management with drag-and-drop
│   ├── Analytics.tsx          # Charts and portfolio analytics
│   ├── AICopilot.tsx          # NLP command engine + chat interface
│   ├── FinancialTracker.tsx   # Revenue/expense/funding tracking
│   ├── RiskMatrix.tsx         # Risk assessment grid
│   ├── PredictiveAlerts.tsx   # AI-powered early warnings
│   ├── StandupGenerator.tsx   # Auto-generated standup reports
│   ├── WeeklyDigest.tsx       # Weekly portfolio summary
│   ├── SettingsView.tsx       # Configuration and venture management
│   └── ...                    # TimelineView, FocusMode, DocumentVault, etc.
├── hooks/
│   ├── useGitHub.ts           # GitHub API polling and stats sync
│   └── useSupabaseSync.ts     # Bidirectional Supabase data sync
└── lib/
    ├── store.tsx              # Central state store (Context + useReducer)
    ├── types.ts               # All TypeScript type definitions
    ├── seed-data.ts           # Default/demo data
    ├── utils.ts               # Shared utilities (generateId, computeHealthScore, etc.)
    ├── theme.tsx              # Dark/light mode provider
    ├── github.ts              # GitHub API client functions
    ├── openai.ts              # OpenAI API client functions
    └── supabase.ts            # Supabase client initialization
```

## Architecture Notes

### State Management

- **Store**: `src/lib/store.tsx` — single `AppState` with `useReducer`. All actions are typed as a discriminated union (`Action` type).
- **Persistence**: State auto-saves to `localStorage` under key `vcc-state`. The useEffect dep array intentionally lists individual data properties (not the full `state` object) to avoid persisting UI-only state changes.
- **Supabase sync**: Optional. When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set, `useSupabaseSync` loads from Supabase on mount and subscribes to realtime changes.

### Key Types (src/lib/types.ts)

- `ViewKey` — union of all view identifiers (dashboard, tasks, analytics, ai, settings, etc.)
- `Action` — discriminated union for all dispatch actions
- `Venture`, `Task`, `Milestone`, `Risk`, `FinancialRecord`, `RecurringTask`, etc. — core data entities
- `VentureWithStats` — computed type extending Venture with task summaries, health scores, etc.
- `VentureTier`: `'Active Build' | 'Incubating' | 'Parked'`
- `TaskPriority`: `'P0' | 'P1' | 'P2' | 'P3'`
- `ResourceType`: `'person' | 'tool' | 'budget' | 'knowledge'`

### Dispatch Pattern

Use proper type casts instead of `as any` when dispatching actions:
```tsx
dispatch({ type: 'SET_ACTIVE_VIEW', payload: viewKey as ViewKey });
```

## Lint and Code Quality

### ESLint Configuration (`eslint.config.js`)

- Uses flat config format (ESLint 9+)
- Extends: `@eslint/js` recommended + `typescript-eslint` recommended
- Plugins: `react-hooks`, `react-refresh`
- **React Compiler rules are disabled** (`preserve-manual-memoization`, `set-state-in-effect`) because React Compiler (babel plugin) is not configured in this project. The `eslint-plugin-react-hooks` v7+ includes these by default in recommended.
- `--max-warnings 0` — all warnings are enforced. Fix or suppress with inline comments.

### Common Lint Patterns

- **`no-console`**: Suppress with `// eslint-disable-line no-console` for intentional logging in hooks/error handlers.
- **`@typescript-eslint/no-explicit-any`**: Avoid `as any`. Use proper types (`ViewKey`, `VentureTier`, `TaskPriority`, `ResourceType`, etc.). For unavoidable cases (e.g., framer-motion type bridging), use `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a reason comment.
- **`react-hooks/exhaustive-deps`**: When intentionally omitting deps (e.g., `today`/`weekAgo` that recalculate each render), place `// eslint-disable-next-line react-hooks/exhaustive-deps` on the line **directly before the dependency array**, not before the hook call.
- **`react-refresh/only-export-components`**: Suppress with `// eslint-disable-next-line react-refresh/only-export-components` for co-located hooks (`useStore`, `useTheme`) that are exported alongside their providers.

### Framer Motion + Native Drag Events

`motion.div` with `draggable` attribute uses native HTML drag events, but framer-motion overrides `onDragStart` typing. Use `(e: any)` with an eslint-disable comment when bridging between the two.

## Build Configuration

- **Vite** with `@vitejs/plugin-react` (standard Babel-based JSX transform, NOT React Compiler)
- **Manual chunks**: vendor (react), charts (recharts), motion (framer-motion), icons (lucide-react), supabase
- **TypeScript**: `jsx: "react-jsx"`, strict mode, bundler module resolution, `noEmit: true`
- **Output**: `dist/` directory
