# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run typecheck    # TypeScript check (no test suite exists)
npm run preview      # Preview production build
```

There are no automated tests. Type-checking (`npm run typecheck`) is the primary correctness gate.

## Architecture

DSFacile is a **fully client-side** React 18 + Vite + TypeScript app — no backend, no authentication, no database. All state is persisted to `localStorage` only.

### Routes

| Path | Page | Purpose |
|---|---|---|
| `/` | `Index` | Marketing landing page (hero, features, pricing, FAQ…) |
| `/login` | `Login` | Stub — writes to console only, no auth |
| `/app` | `DsfHome` | Module picker between DSF normale and SMT |
| `/app/normal` | `DsfWorkspace mode="normal"` | Full DSF Système Normal workspace |
| `/app/smt` | `DsfWorkspace mode="smt"` | DSF Système Minimal de Trésorerie workspace |
| `/admin` | `AdminDashboard` | Stub — hardcoded stats, no real data |

`Login`, `AdminDashboard`, `DsfHome`, and `DsfWorkspace` are lazy-loaded via `React.lazy`.

### Core business logic: `src/features/dsf/index.ts`

All DSF domain logic lives in a **single flat file** (no sub-modules). It is entirely pure/functional — no React, no side effects except `localStorage` and browser download APIs. Key exports:

- **Types**: `DsfMode` (`"normal" | "smt"`), `DsfLine`, `DsfDeclaration`, `CompanyProfile`, `DsfSummary`, `ValidationIssue`
- **`createDeclaration(mode)`** — factory for a blank declaration
- **`createLine(kind, code?, label?)`** — factory for a single financial line
- **`normalizeDeclaration(declaration)`** — canonicalises amounts (rounds to integer), uppercases codes/NIU, resets invalid section names; **call before any calculation or export**
- **`calculateSummary(declaration)`** — returns totals and gap indicators (balance gap, cash gap)
- **`validateDeclaration(declaration)`** — returns `ValidationIssue[]`; errors block XLSX export, warnings appear in the workbook
- **`loadDeclaration(mode)` / `saveDeclaration(declaration)` / `clearDeclaration(mode)`** — localStorage persistence keyed `dsfacile:<mode>:declaration:v1`
- **`parseCsv(mode, csv)`** — parses semicolon-delimited CSV into `DsfLine[]`; first row is skipped if it starts with `type;` or `etat;`
- **`exportDeclarationToXlsx(declaration)`** — generates a real XLSX (Open XML) **from scratch** in-browser using a hand-rolled ZIP/CRC32 implementation; triggers a browser download

The XLSX generator has **no external dependency** — it constructs the ZIP bytes manually. Do not introduce `xlsx` / `exceljs` libraries unless the hand-rolled approach is being replaced entirely.

### `DsfWorkspace` (`src/pages/DsfWorkspace.tsx`)

The primary application screen. Receives `mode: DsfMode` as a prop from the router. Owns all UI state: the `DsfDeclaration` object, CSV preview text. Auto-saves to localStorage on every state change via `useEffect`. All financial calculations are `useMemo`-derived from the declaration. Inline sub-components (`Field`, `Metric`, `downloadText`, `issueClass`) are defined at the bottom of the file to avoid an extra file for small UI helpers.

### UI components

All UI primitives in `src/components/ui/` are **shadcn/ui** components (Radix UI-based). Add new ones via `npx shadcn@latest add <component>` — do not hand-write Radix wrappers. The `cn()` helper in `src/lib/utils.ts` merges Tailwind classes (`clsx` + `tailwind-merge`).

### Styling

Tailwind CSS with a custom colour palette:
- `primary`: `#22577A` (dark blue) — main brand colour
- `secondary`: `#38A3A5` (teal)
- `accent`: `#57CC99` (green) — CTA / highlights
- Font: Poppins (extended in `tailwind.config.ts`)

Use `className` with Tailwind utilities throughout; avoid inline styles. The `@` alias resolves to `src/`.

## Key constraints

- **No backend**: the `/login` and `/admin` routes are non-functional stubs. Do not add server calls without introducing a proper backend layer.
- **Regulatory scope**: XLSX exports are internal preparation workbooks, not official DGI filings. Any changes to the financial calculation logic (`calculateSummary`, `validateDeclaration`) must preserve the Cameroonian OHADA/SYSCOHADA semantics documented in `PRODUCTION_READINESS_AUDIT.md`.
- **localStorage only**: declarations persist only in the user's browser. There is no sync, backup, or multi-device support.
- **No test suite**: rely on `npm run typecheck` and `npm run lint` for correctness feedback. Manual browser testing is required for UI changes.
