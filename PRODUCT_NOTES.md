# DairyFlow — Product Notes

## Core product thesis

DairyFlow is not seven separate admin screens bolted together — it is one operating picture of a dairy business, built around a single idea: **milk production capacity, herd health, inventory, and buyer demand are all the same business, viewed from different angles.** A farm manager doesn't think "let me check the Leads module today"; they think "can I take on that new hotel contract, and will my feed stock and my sick buffalo let me deliver on it." The product is designed so that question can actually be answered from one place, with one number that doesn't contradict itself between screens.

Concretely, every screen reads from and writes to a single shared, persisted application state (`src/store/AppDataContext.tsx` + `src/store/selectors.ts`), not its own local copy of "the data." A vaccination logged in Herd & Health clears the matching Dashboard alert instantly. A Stock In transaction in Inventory updates the Dashboard's low-stock count and the Reports consumption chart in the same render. There is exactly one function that computes "today's milk total," one that computes "available surplus," and one that computes "active leads" — every screen calls the same function.

## Primary user

**Jitesh Bhati — owner-operator of Bhati Dairy Farm, Jodhpur, Rajasthan.** He is simultaneously the farm manager, the person who talks to buyers, the person who decides what to restock, and the person a vet calls when an animal is sick. He is not a data analyst: he wants to open the app, see what needs doing today, tap a button, and get back to the farm. He is the target for every design decision in this prototype — dashboards that prioritize action over passive charts, forms with sensible defaults, and language that matches how a working dairy farmer actually talks about the business (litres per day, ₹ per litre, vaccination due, stock running low) rather than generic SaaS/CRM jargon.

## Why the modules are connected, not independent

- **Herd & Health ↔ Milk Production ↔ Dashboard.** An animal's health status and vaccination schedule directly drive Dashboard alerts and Today's Priorities. A logged health event or completed vaccination doesn't just update one animal's record — it removes the corresponding alert everywhere it appeared, because alerts are *derived* from live animal data, never stored as a separate stale list.
- **Milk Production ↔ Leads ↔ Dashboard ("Available to Sell").** A dairy farm can only sell what it produces. The "Available to Sell" estimate on the Dashboard, and the capacity-gap warning on the Leads page, both start from the same `computeCapacity()` selector: today's actual logged production, minus an estimated processing/household reserve, minus litres already committed to signed ("Won") buyers. If Milk Production numbers change (a new entry, a herd having a bad day), the Leads page's capacity warning changes with it — because closing a new contract you can't supply is a bigger business risk than a missed follow-up.
- **Inventory ↔ Herd & Health ↔ Tasks.** Feed and medicine stock-outs are a herd-health risk, not just a purchasing annoyance. Low-stock and expiring items surface on the Dashboard next to animal health alerts, and "Create Restock Task" writes directly into the same Tasks list a vet follow-up would use — because on a real farm, these compete for the same person's attention on the same morning.
- **Reports** is intentionally not a fifth, independent data source. Every chart and KPI on Reports is the same selector logic used on Dashboard/Leads/Inventory, just aggregated over a longer window — so a manager can trust that "this week's number" on Reports is the same math as "today's number" on the Dashboard.

## Why lead capacity depends on milk production

A dairy farm's supply is not elastic day to day — you cannot manufacture more milk because a hotel signs a contract. Treating "sales pipeline" and "milk production" as unrelated (as a generic CRM would) lets a manager over-promise: sign three new buyers whose combined demand exceeds what the herd actually produces after existing commitments and processing needs. The Leads page computes `advancedStageDemand` (litres wanted by leads in Proposal Sent / Negotiation — the ones close to closing) against `availableToSell` (today's production, minus an estimated processing reserve, minus litres already committed to Won buyers) and surfaces a clear, labeled-as-an-estimate warning when advanced demand would outstrip supply. This turns lead management from "grow sales at any cost" into "grow sales the farm can actually deliver on" — a materially different, more honest recommendation for a production-constrained business.

## Why inventory transactions are more useful than manually changing balances

Directly editing "current stock: 180 → 380" answers *what* changed but destroys *why* and *when* — which is exactly the information a manager needs when feed runs out faster than expected, or when reconciling with a supplier invoice. Every stock change in DairyFlow is now a typed transaction (`Stock In`, `Consumed`, `Wastage`, `Expired`, `Correction`) with a date, optional supplier, and notes, stored in `inventoryTransactions` alongside the item itself. This unlocks three things a raw balance-edit can't:
1. **An audit trail per item** — "why is Green Fodder always low?" is answerable by looking at its consumption transactions, not just its current number.
2. **A real Inventory Consumption report** — Reports' "consumed fastest" insight and chart are computed by filtering transactions within a date range, not guessed.
3. **Loss visibility** — Wastage and Expired are tracked as distinct transaction types, so a manager can see how much stock is being lost to spoilage versus legitimate use, which a single balance number can never show.

## Why the dashboard prioritizes actions over passive reporting

A list of alerts that only *describes* problems ("DF-104 vaccination due tomorrow") still leaves the manager to open another screen, find the record, and figure out what to do. "Today's Priorities" instead pairs every alert with the specific next action available for its type — Mark completed, Snooze, Create task for a vaccination; View animal, Schedule vet review for a health issue; Adjust Stock, Create restock task for inventory; Mark contacted, Reschedule for an overdue follow-up. The goal is that resolving a priority item takes one tap from the Dashboard, not a multi-screen detour — because on a working farm, the cost of "I'll deal with it later" is a sick animal or an angry buyer, not a missed KPI.

## Frontend-only assumptions

- One dairy farm per account (Bhati Dairy Farm, Jodhpur, Rajasthan). No multi-tenant or multi-farm data model.
- All data lives in `localStorage` under a single versioned key (`dairyflow.state`, current version `3`). There is no server, no network request, and no real authentication anywhere in the app.
- Historical data (90 days of milk production, ~30–40 inventory transactions) is generated by a **deterministic** formula (a fixed pseudo-random hash plus a smooth trend/seasonal wave) at first load, not fetched — so the same "history" appears every time the demo data is reset, and every number is explainable rather than random.
- "Available to sell" and "demand vs. capacity" figures are clearly labeled estimates using simple, stated assumptions (a flat 12% processing/household reserve) — they are illustrative of the *product idea* of supply-aware sales, not a real yield-forecasting model.
- The Farm Assistant answers from the same local, deterministic state via keyword matching — it is explicitly not connected to a hosted LLM, and says so in its own UI copy.
- Voice input uses the browser's built-in Web Speech API where available; it degrades to a disabled (not broken) mic button in unsupported browsers.

## Future backend architecture (not implemented)

If DairyFlow moved beyond a local prototype, the natural next step is not "add a database under the current React state" but a proper service boundary:

- **API layer**: a REST or GraphQL API fronting a relational database (Postgres), with tables mirroring today's domain types (`animals`, `milk_entries`, `inventory_items`, `inventory_transactions`, `leads`, `tasks`) plus an `activity_log` and a real `alerts` table populated by scheduled jobs rather than computed on every render.
- **Auth & multi-tenancy**: real accounts, farm-level tenancy, and role-based access (owner, farm manager, vet staff, inventory manager, sales) so the "one login sees everything" MVP assumption can be relaxed per the Future Scope list below.
- **Background jobs**: a scheduler that recomputes derived alerts and capacity estimates periodically (or on write) server-side, so mobile clients don't need to recompute them from a large in-memory dataset.
- **Sync**: an offline-first mobile client (see Future Scope) would need conflict resolution for records edited on a phone with poor connectivity — most naturally handled with per-record versioning and last-write-wins with a manual merge UI for genuine conflicts.
- **Integrations**: webhook/ingestion endpoints for IoT milk meters and veterinary systems, replacing today's manual "Record Production" / "Record vaccination" forms with automatic writes, while keeping the manual forms as a fallback.

None of this is implemented here — the frontend prototype's job is to prove the product idea and interaction model first.

## Target users

- **Dairy farm owner** — cares about overall performance, revenue growth, and risk (herd health, stock-outs).
- **Farm manager** (primary persona — Jitesh Bhati) — runs daily operations across animals, production, inventory, and staff tasks.
- **Veterinary / animal-care staff** — logs health events, vaccinations, and treatment follow-ups.
- **Inventory manager** — tracks feed, medicine, vaccine, and equipment stock levels via typed transactions.
- **Sales / customer relationship manager** — manages buyer leads against real production capacity.

## Feature rationale

- **Dashboard** — the single screen that answers "what should I do today," combining actionable priorities, a supply/demand estimate, and passive KPIs — in that order of visual priority.
- **Herd & Health** (formerly Farm Records) — centralizes animal identity, health timeline, vaccination schedule, and breeding information; the source of truth every alert and report references.
- **Milk Production** — daily yield tracking by herd group with morning/evening splits, quality (fat/SNF), and rejection tracking, plus insights that point back to the specific animals or herds behind a trend.
- **Inventory** — transaction-based stock tracking (not balance-editing) so consumption, wastage, and restocking are all visible and reportable.
- **Leads** — a dairy-specific CRM that weighs sales opportunity against actual production capacity, not just against a generic sales quota.
- **Tasks** — the shared to-do list for every module's follow-up obligations (vet visits, restocks, buyer calls), so nothing is dropped between screens.
- **Reports** — the same shared selectors as every other screen, aggregated over a selectable 7/30/90-day window, with plain-language insights instead of chart-reading homework.
- **Farm Assistant** — a transparent, deterministic natural-language shortcut into the same shared state, for when tapping through menus is slower than asking a question.

## Product principles

- Important information should be visible without excessive navigation — the Dashboard's Today's Priorities exists so a manager never has to hunt across five screens to know what today requires.
- Alerts should be actionable rather than merely informational — every alert on the Dashboard carries the specific buttons needed to resolve it, not just a description.
- Daily data entry should require minimal effort — production, stock, and health-event forms use short, single-purpose fields with sensible defaults.
- High-risk health and inventory conditions should be visually prominent — status badges and color (amber/red) are reserved for genuine attention states, including dual-risk conditions (e.g. an item that is both low-stock *and* expiring shows both, never hides one behind the other).
- The product must work for users who are not highly technical — plain language, no jargon, predictable form and table patterns throughout.
- Cross-module numbers must never disagree — every KPI is computed once, in `src/store/selectors.ts`, and every screen calls that same function.

## MVP assumptions

- One dairy farm per account (Bhati Dairy Farm, Jodhpur, Rajasthan).
- All application state lives in a single React Context + reducer, persisted to `localStorage` (versioned; a version bump safely resets stale shapes rather than crashing on old data).
- No backend, no real authentication, no payment processing, no network requests anywhere.
- No IoT or milking-machine integration — all entries are manual, deliberately, so the interaction model (quick actions, forms) is what gets tested.
- English-only interface.
- A "Reset Demo Data" action (in the header's user menu) clears `localStorage` and restores the original seed data at any time.

## Future scope (not implemented)

- Multi-farm support for operators running more than one location.
- Role-based access control (separate views/permissions for vet staff, inventory manager, sales).
- Veterinary system integrations for automatic health record sync.
- IoT milk-meter integration for automatic yield logging.
- Automated billing and invoicing for buyer contracts.
- Milk collection and delivery route planning.
- Supplier purchase order workflows.
- Expense tracking and profitability analysis.
- WhatsApp-based reminders for tasks and follow-ups.
- Offline-first mobile experience for use in low-connectivity barns.
- Regional-language support (Hindi, Marathi, etc.).
- Predictive health and yield alerts using historical trends (today's alerts are threshold-based on the latest data, not a trained model).
