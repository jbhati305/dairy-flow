# DairyFlow

A frontend-only prototype of a business management platform for dairy farms — built for **Bhati Dairy Farm** (Jodhpur, Rajasthan). React, TypeScript, Vite, Tailwind CSS, Radix-based UI components, and Recharts. No backend: all data lives in a single shared React Context + reducer, persisted to `localStorage`. See `PRODUCT_NOTES.md` for the full product rationale and `DEMO_SCRIPT.md` for a guided walkthrough.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (e.g. http://localhost:5173).

```bash
npm run build     # type-check + production build
npm run lint      # oxlint over src/
npm run preview   # preview the production build locally
```

## Architecture

All domain data (animals, milk production entries, inventory items + transactions, leads, tasks, activity log) lives in one shared store: `src/store/AppDataContext.tsx` (Context + reducer, persisted to a versioned `localStorage` key) and `src/store/selectors.ts` (pure derived calculations — KPIs, alerts, herd summary, available-to-sell capacity, lead conversion, inventory consumption). Every page reads from this single source, so the same metric never disagrees with itself across screens, and every reducer action is undoable in spirit via the header's **Reset Demo Data** action.

Historical data (90 days of milk production, ~30–40 inventory transactions) is generated deterministically (`src/data/milkProduction.ts`, `src/data/inventory.ts`) — same numbers every time the demo resets, fully explainable, no `Math.random()`.

## Screens & features

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

- **Today's Priorities** — curated, actionable alert cards (vaccination due, yield decline, low stock, overdue follow-up), each with one-tap resolutions (Mark completed, Adjust Stock, Mark contacted, Snooze, Create task) rather than passive descriptions.
- KPI tiles derived from the shared store: total cattle, lactating cattle, milk produced today, average yield/animal, low-stock items, active sales leads.
- 7-day milk production trend chart and herd overview by status.
- **Available to Sell** — an estimate of surplus milk for new buyers (today's production, minus a processing reserve, minus litres already committed to signed buyers), with a capacity-gap warning.
- Recent-activity timeline logged automatically by every write action across the app.
- **Farm Assistant** — a floating "Ask DairyFlow" button opening a slide-over chat with text and voice (mic) input. Answers deterministically from the shared store (not a hosted LLM, by design) and includes clickable suggested questions and in-chat links to the relevant page.

### Herd & Health
![Herd & Health](docs/screenshots/farm-records.png)

- Searchable, filterable (breed / health status / lactation status), sortable, paginated cattle table with **Add** and **Edit**.
- Animal detail view with quick actions — **Log health event**, **Record vaccination**, **Add breeding event**, **Record milk yield**, **Create veterinary task** — plus a health timeline (vaccination, check-up, treatment, illness, recovery, breeding events) and any open tasks linked to that animal, completable in place.

### Milk Production
![Milk Production](docs/screenshots/milk-production.png)

- Morning / evening / total production, average yield, rejected-milk, and fat/SNF summary tiles — all matching the Dashboard's numbers exactly.
- 14-day production trend chart with insights (change vs. yesterday, best-performing herd, animals with a meaningful yield decline — clickable through to their record).
- **Record Production** dialog with auto-computed quality status.

### Inventory
![Inventory](docs/screenshots/inventory.png)

- Low-stock alert banner, stock-status summary tiles, and dual-risk badges (an item that's both low-stock *and* expiring shows both conditions, never hides one).
- **Adjust Stock** — a transaction-based workflow (Stock In / Consumed / Wastage / Expired / Correction) with date, supplier, and notes, replacing ambiguous balance-editing. Every transaction is stored and feeds the Reports consumption chart.
- Item details dialog with recent transaction history and a **Create restock task** shortcut.

### Leads (CRM)
![Leads](docs/screenshots/leads.png)

- Dairy-specific fields: required litres/day, product type, price/litre, delivery location/distance/timing, trial order status — alongside the standard stage, source, and follow-up fields.
- Kanban pipeline across 7 stages with drag-and-drop **and** a reliable "Move to..." menu; quick actions for Mark contacted, Reschedule follow-up, Mark trial complete, Mark Won/Lost.
- Table view toggle; a capacity banner warns when advanced-stage demand exceeds the farm's estimated available surplus (tied directly to Milk Production).

### Tasks
![Tasks](docs/screenshots/tasks.png)

- Filterable list of vet visits, vaccinations, breeding follow-ups, inventory purchases, buyer follow-ups, and equipment maintenance — shared with Herd & Health and Inventory quick actions.
- Overdue items flagged in red; one-click complete/reopen toggle.

### Reports
![Reports](docs/screenshots/reports.png)

- A working **period selector** (Last 7 / 30 / 90 Days) that re-aggregates every chart and KPI on the page from the same shared selectors used elsewhere.
- Auto-generated, plain-language **Insights** (e.g. "Milk production increased 3.4% compared with the previous period", "Holstein Friesian animals had the highest average yield").
- Charts: milk production trend, herd productivity by breed (using real lactating-animal counts), inventory stock health and consumption, and sales lead conversion.

### Global search
Press the search bar (or `⌘K` / `Ctrl K`) anywhere in the app for a command-style dialog searching animals, inventory items, leads, and tasks by name — selecting a result navigates to and opens that record.

## Design decisions

- Deep green as the primary brand accent on white/neutral surfaces; amber and red are reserved for genuine warning states.
- A small shared UI kit (button, card, badge, dialog, select, tabs, dropdown, toast, etc.) is used consistently across every screen, with each module's layout tailored to its primary workflow rather than a repeated "KPI row + table" template everywhere.
- The global "Add Record" menu in the header deep-links into each page's own add dialog (`?new=1`); search results deep-link into detail views (`?open=<id>`).

## Cross-module scenarios (manually verified)

1. **Inventory**: open a low-stock item → record a Stock In transaction → status, dashboard low-stock KPI, and the related alert all update → refresh retains the change.
2. **Lead**: add a lead with litres/day and price → move its stage → reschedule its follow-up → dashboard active-lead/follow-up metrics and capacity calculations update → refresh retains the change.
3. **Animal health**: open an animal with a vaccination due → record the vaccination → next check-up updates and the dashboard alert clears → refresh retains the change.
4. **Milk production**: add a production record → daily totals, average yield, dashboard, and reports all update to the same number → refresh retains the record.

## Known scope cuts

- The Farm Assistant answers from the app's local, deterministic shared state with keyword matching — it is not connected to a hosted LLM (this is a frontend-only, no-backend prototype), and its own copy says so.
- "Available to Sell" and "Demand vs Capacity" are clearly labeled estimates based on a simple stated assumption (a flat 12% processing/household reserve), not a real forecasting model.
- Reports' herd-productivity and lead-conversion figures use real counts/dates from the shared store, but individual animal yield records and herd-level milk log entries remain two independently-authored datasets — they are internally consistent, not perfectly reconciled animal-by-animal.
