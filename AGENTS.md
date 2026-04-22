# AGENTS.md – Fornix Link

**Fornix Link** is a healthcare platform (Next.js 16 App Router, React 19, TypeScript) connecting patients, doctors, and admins. The repo name is `zomujo`; the product name is `Fornix Link` (see `src/constants/branding.constant.ts`).

API docs: `https://emr-do80.onrender.com/docs#/`

---

## Developer Workflows

```bash
yarn dev             # Turbopack dev server
yarn build           # Production build
yarn lint            # ESLint (next + prettier + a11y rules)
yarn format          # Prettier write (ts, tsx, html, scss, css)
yarn test            # Jest (jsdom environment, coverage enabled)
yarn test:watch      # Jest watch mode
```

Commits **must** follow Conventional Commits (enforced by commitlint + husky):
`feat:`, `fix:`, `chore:`, `refactor:`, etc.

---

## Architecture

### Route Layout (App Router)
```
src/app/
  (auth)/            # Public auth pages: login, sign-up, forgot-password, verify-email, oauth
  dashboard/
    (patient)/       # Patient-only routes: find-doctor, book-appointment, records, consultation
    (doctor)/        # Doctor-only routes: consultation, patients
    (admin)/         # Admin-only routes
    appointment/     # Shared
    settings/
  onboarding/        # Multi-step doctor onboarding flow
  verify-payment/
```

Route groups use `_components/` directories for co-located, segment-specific components.

### State Management (Redux Toolkit + redux-persist)
- **Only `authentication` slice is persisted** (whitelist: `user`, `extra`, `loggedInAt`, `hideOnboardingModal`).
- Each domain under `src/lib/features/` follows a strict three-file pattern:
  - `*Slice.ts` – state shape & reducers
  - `*Thunk.ts` – `createAsyncThunk` API calls
  - `*Selector.ts` – `createSelector` memoised selectors
- Always use typed hooks from `src/lib/hooks.ts`: `useAppDispatch`, `useAppSelector`, `useAppStore`.

### Roles
Four roles in `Role` enum: `patient`, `doctor`, `admin`, `superadmin`. Each role has its own sidebar config in `src/constants/sidebar.constant.ts`. Use selectors like `selectIsPatient`, `selectIsDoctor`, `selectIsAnAdmin` from `src/lib/features/auth/authSelector.ts` for role checks.

### HTTP & API
Three Axios instances in `src/lib/axios.ts`:
- `axios` (default export) – main API (`NEXT_PUBLIC_API_URL`), has the 401 session-expiry interceptor.
- `axiosFornix` – secondary Fornix service (`NEXT_PUBLIC_FORNIX_URL`).
- `axiosBase` – plain instance with no base URL.

**Thunk return convention**: thunks return `Toast | Data`. After `await dispatch(someThunk(args))`, check `showErrorToast(payload)` to detect errors, then call `toast(payload)`. See `useFetchPaginatedData` hook for canonical usage.

### Real-time
WebSocket via `socket.io-client` (`NEXT_PUBLIC_WS_URL`). Use the `useWebSocket` hook (`src/hooks/useWebSocket.tsx`); it dispatches incoming notifications to the `notifications` Redux slice and plays `public/audio/fornix-link-notification-sound.wav`.

### Session Management
Sessions expire server-side after 24 h. The axios interceptor triggers logout at 23.5 h. On 401, it saves the current URL via `LocalStorageManager.saveRedirectUrl()` and sets a session-expired flag before redirecting to `/login`. Use `LocalStorageManager` (static class in `src/lib/localStorage.ts`) for all localStorage access.

---

## Key Patterns

### Forms
`react-hook-form` + `zod`. Always start from shared primitives in `src/schemas/zod.schemas.ts` (`requiredStringSchema`, `passwordSchema`, `emailSchema`, `nameSchema`, etc.). Compose domain schemas on top (e.g., `src/schemas/booking.schema.ts`). Use `MODE.ON_TOUCH` (`src/constants/constants.ts`) as the form `mode`.

### Styling
Tailwind CSS v4 with shadcn-style components in `src/components/ui/`. Always use the `cn()` helper (`src/lib/utils.ts`) to merge class names. `prettier-plugin-tailwindcss` auto-sorts classes on format.

### Pagination & Lists
- **Paginated tables**: `useFetchPaginatedData` hook — pass a thunk that accepts `IQueryParams` and returns `Toast | IPagination<T>`.
- **Infinite scroll lists**: `useInfiniteScroll` hook — returns a ref callback to attach to the last item.

### Image Wildcards
`next.config.ts` currently allows all remote image hostnames (`hostname: '**'`). This is temporary pending real production URLs.

---

## Required Environment Variables
| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Main backend REST API |
| `NEXT_PUBLIC_FORNIX_URL` | Secondary Fornix service |
| `NEXT_PUBLIC_WS_URL` | WebSocket server for notifications |


- Let's avoid type `any` in the codebase. 
- Let's avoid nested ternary operators for readability.
- Let's avoid inverted conditional logic.
