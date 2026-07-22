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

- Four primary KPI tiles (herd size, milk produced today, avg. yield/animal, active leads) plus a compact secondary metric strip (low-stock items, week-over-week production, herd on record) — not a wall of six same-sized cards.
- **Today's Priorities** — a compact, divider-separated list (not nested cards) showing the 4 highest-priority alerts with one primary action per row and an overflow menu for secondary actions (Mark completed, Adjust Stock, Mark contacted, Snooze, Create task); critical/warning counts badge the header, and "View all N priorities" expands the rest in place.
- Two-column operational layout: 7-day milk production trend (with herd status mini-bars) on the left, Today's Priorities on the right, so the trend is never buried below the fold.
- **Available to Sell** — an estimate of surplus milk for new buyers (today's production, minus a processing reserve, minus litres already committed to signed buyers), with a capacity-gap warning.
- Recent-activity timeline logged automatically by every write action across the app.
- **Farm Assistant** — a compact, icon-led floating launcher opening a slide-over chat with text and voice (mic) input. Answers deterministically from the shared store (not a hosted LLM, by design) and includes clickable suggested-question chips and in-chat links to the relevant page.

### Herd & Health
![Herd & Health](docs/screenshots/farm-records.png)

- A scannable table (Animal with avatar/name/ID+age, Breed, Lifecycle status, Milk today, Health, Next action, overflow actions) instead of a ten-column dense grid — sticky header, hover/focus states, and the entire row is clickable.
- Simplified filters: search, the two most-used dropdowns (lactation, health status) inline, a **More Filters** popover for breed/sort, active filter chips, and Clear all — select labels are never truncated.
- Animal details now open in a **right-side drawer** (not a small centered dialog) with quick actions — **Log health event**, **Record vaccination**, **Add breeding event**, **Record milk yield**, **Create veterinary task** — a health timeline, vaccination/breeding/yield tabs, and any open tasks linked to that animal, completable in place.

### Milk Production
![Milk Production](docs/screenshots/milk-production.png)

- Four primary KPI tiles (morning, evening, total, avg. yield/animal) plus a compact **Quality** panel (fat %, SNF %, rejected/spoiled) — zero rejected milk renders in neutral styling, not as a false alarm.
- 14-day production trend chart with insights (change vs. yesterday, best-performing herd, animals with a meaningful yield decline — clickable through to their record, with correct singular/plural grammar).
- **Record Production** dialog with auto-computed quality status.

### Inventory
![Inventory](docs/screenshots/inventory.png)

- Each row shows a stock-level progress bar (current vs. minimum), expiry countdown, and status badges — an item that's both low-stock *and* expiring shows both signals, never hides one. At-risk rows get a light amber tint.
- The "items need attention" banner is clickable and filters the table to just those items.
- One contextual primary action (**Adjust Stock**) per row plus an overflow menu (View details, Create restock task); the whole row opens the details view.
- **Adjust Stock** — a transaction-based workflow (Stock In / Consumed / Wastage / Expired / Correction) with date, supplier, and notes, replacing ambiguous balance-editing. Every transaction is stored and feeds the Reports consumption chart.

### Leads (CRM)
![Leads](docs/screenshots/leads.png)

- Four primary metrics (Active Leads, Pipeline Value, Available Surplus, Capacity Gap) plus a secondary strip (required L/day, follow-ups due) instead of six same-sized cards.
- A **Supply vs. demand** panel replaces the old capacity-warning banner: available surplus, advanced-stage demand, % of capacity used (with a progress bar), shortfall/remaining capacity, and a one-line recommendation.
- Dairy-specific fields: required litres/day, product type, price/litre, delivery location/distance/timing, trial order status — alongside the standard stage, source, and follow-up fields.
- Kanban pipeline across 7 stages, minimum 280px columns, sticky stage headers, a right-edge fade cue signaling more columns are scrollable, and intentional empty states per stage. Cards lead with business name, buyer type, required L/day, estimated monthly value, and next follow-up, with a clear **Overdue** badge. Drag-and-drop **and** a reliable "Move to..." menu; quick actions for Mark contacted, Reschedule follow-up, Mark trial complete, Mark Won/Lost.
- Table view toggle for a denser, sortable alternative to the board.

### Tasks
![Tasks](docs/screenshots/tasks.png)

- Tasks are grouped into **Overdue / Today / Next 7 Days / Later / Completed** sections instead of one long uniformly-bordered list, with a larger checkbox tap target and clear due-date/priority hierarchy.
- Filterable by category and free-text search; overdue items flagged in red; one-click complete/reopen toggle.

### Reports
![Reports](docs/screenshots/reports.png)

- Four primary KPI tiles (total milk, avg. yield/animal, lead conversion, pipeline value) plus a secondary strip (herd productivity, inventory items needing attention). When there are no closed leads in the selected period, conversion reads **"No closed leads yet"** instead of a misleading 0%.
- A working **period selector** (Last 7 / 30 / 90 Days) that re-aggregates every chart and KPI on the page from the same shared selectors used elsewhere.
- **Insights** as compact, color-coded cards (positive trend, risk, operational observation, recommended action) instead of a plain bullet list — relevant ones deep-link to the related page.
- Charts: milk production trend, herd productivity by breed (horizontal bars so long breed names never wrap or truncate), inventory stock health and consumption, and sales lead conversion.

### Global search
Press the search bar (or `⌘K` / `Ctrl K`) anywhere in the app for a command-style dialog searching animals, inventory items, leads, and tasks by name — selecting a result navigates to and opens that record. On desktop the header shows the search bar in place of a repeated page title (the current page name only appears in the mobile header); the header's quick-add control is a compact secondary dropdown so it never competes visually with each page's primary Add button.

## Design decisions

- Deep green as the primary brand accent on white/neutral surfaces; amber and red are reserved for genuine warning states. Sidebar active-state uses a solid brand-700 fill for strong contrast rather than a light tint.
- A small shared UI kit (button, card, badge, dialog, select, tabs, dropdown, toast, etc.) is used consistently across every screen, with each module's layout tailored to its primary workflow rather than a repeated "KPI row + table" template everywhere.
- Three levels of elevation: page background, white panels, and divider-separated internal rows — cards-inside-cards are avoided in favor of dividers wherever a nested card would have been purely structural.
- KPI rows cap at 4 cards per row on desktop (2 on tablet/mobile); anything beyond the primary metrics moves into a compact secondary strip or panel.
- Content is capped at a max width and consistent horizontal padding (16px mobile / 20–24px tablet / 24–32px desktop) so the layout never stretches awkwardly on very wide screens.
- The header's Quick add menu deep-links into each page's own add dialog (`?new=1`); search results and priority/insight actions deep-link into detail views (`?open=<id>`).

## Cross-module scenarios (manually verified)

1. **Inventory**: open a low-stock item → record a Stock In transaction → status, dashboard low-stock KPI, and the related alert all update → refresh retains the change.
2. **Lead**: add a lead with litres/day and price → move its stage → reschedule its follow-up → dashboard active-lead/follow-up metrics and capacity calculations update → refresh retains the change.
3. **Animal health**: open an animal with a vaccination due → record the vaccination → next check-up updates and the dashboard alert clears → refresh retains the change.
4. **Milk production**: add a production record → daily totals, average yield, dashboard, and reports all update to the same number → refresh retains the record.

## Known scope cuts

- The Farm Assistant answers from the app's local, deterministic shared state with keyword matching — it is not connected to a hosted LLM (this is a frontend-only, no-backend prototype), and its own copy says so.
- "Available to Sell" and "Demand vs Capacity" are clearly labeled estimates based on a simple stated assumption (a flat 12% processing/household reserve), not a real forecasting model.
- Reports' herd-productivity and lead-conversion figures use real counts/dates from the shared store, but individual animal yield records and herd-level milk log entries remain two independently-authored datasets — they are internally consistent, not perfectly reconciled animal-by-animal.
