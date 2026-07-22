# DairyFlow — Product Notes

DairyFlow is a frontend prototype of a business management platform for small and mid-sized dairy farms, built around a single operator persona: someone who runs both the animal/production side and the commercial side of a dairy business from one screen.

## Target users

- **Dairy farm owner** — cares about overall performance, revenue growth, and risk (herd health, stock-outs).
- **Farm manager** (primary persona for this prototype — Jitesh Bhati, Bhati Dairy Farm) — runs daily operations across animals, production, inventory, and staff tasks.
- **Veterinary / animal-care staff** — logs health events, vaccinations, and treatment follow-ups.
- **Inventory manager** — tracks feed, medicine, vaccine, and equipment stock levels.
- **Sales / customer relationship manager** — manages buyer leads and recurring milk sales relationships.

In this MVP, one login (Farm Manager) has visibility into all of these workflows, since most small dairy operations don't yet have role-separated software — the manager is usually doing all of it.

## Primary problems

- Paper-based or fragmented records for animals, health events, and production make it hard to spot trends (e.g. a slow yield decline) before they become serious.
- No single view of herd health status, so urgent issues (vaccination due, suspected mastitis) get missed.
- Feed, medicine, and vaccine stock-outs interrupt operations and put animal health at risk.
- Inventory expiry (medicines, vaccines) is easy to miss without proactive alerts.
- Recurring operational tasks (vet visits, follow-ups, equipment maintenance) live in someone's head or a notebook, so things get dropped.
- Buyer relationships are managed ad hoc — no structured pipeline, so follow-ups get missed and revenue growth stalls.
- No consolidated view of how the business is performing, so decisions are reactive rather than data-driven.

## Feature rationale

- **Dashboard** — Farm managers start the day here. It surfaces the handful of numbers and alerts that matter most (herd size, today's production, stock issues, active leads) without requiring navigation into individual modules, and puts actionable alerts front and center rather than burying them in menus.
- **Farm Records** — Centralizes animal identity, health history, vaccination schedule, and breeding information per animal. This replaces paper registers and is the source of truth that other modules (dashboard alerts, milk production) reference.
- **Milk Production** — Daily yield tracking by herd group is the core production metric of the business. Tracking morning/evening splits, fat/SNF quality, and rejected milk lets a manager catch feed or health issues early and defend milk pricing/quality claims to buyers.
- **Inventory** — Feed, medicine, vaccines, and equipment are consumed continuously and silently. Proactive low-stock and expiry visibility prevents both operational interruptions (no feed) and financial loss (expired medicine).
- **Lead Management** — Moves the business beyond "sell whatever comes"; a lightweight CRM pipeline lets the farm systematically grow recurring B2B milk sales (hotels, distributors, retailers) instead of relying on ad hoc walk-ins.
- **Tasks** — Dairy operations are full of recurring, time-sensitive obligations spanning every other module (vet visits, vaccination boosters, buyer follow-ups, restocking). A single task list prevents anything from being dropped between modules.
- **Reports** — Aggregates data already captured elsewhere into decision-ready views (productivity by breed, lead conversion, stock health) so the owner/manager can make resourcing and sales decisions without manually cross-referencing modules.

## Product principles

- Important information should be visible without excessive navigation — the dashboard exists so a manager never has to open five screens to know if today is "normal."
- Alerts should be actionable rather than merely informational — every alert names a specific record (animal ID, item, lead) so the next step is obvious.
- Daily data entry should require minimal effort — production and stock updates use short, single-purpose forms with sensible defaults, not multi-page wizards.
- High-risk health and inventory conditions should be visually prominent — status badges and color (amber/red) are reserved for genuine attention states, not decoration.
- The product must work for users who are not highly technical — plain language, no jargon, and predictable form/table patterns throughout.
- Deterministic farm workflows (recording milk, logging a vaccination, restocking) should remain simple and predictable, even as the product grows more features over time.

## MVP assumptions

- One dairy farm per account (Bhati Dairy Farm, Jodhpur, Rajasthan).
- Mock data only, defined in `src/data/*` — nothing is fetched from a network.
- No backend, no real authentication, no payment processing.
- No IoT or milking-machine integration — all entries are manual.
- English-only interface.
- Interactions (adding records, updating stock, moving leads, completing tasks) update in-memory component state; they are not persisted to `localStorage` or a database, so a refresh resets demo data. This was a deliberate scope cut to prioritize breadth and polish across all modules within the time budget — persistence is a natural next increment.

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
- Predictive health and yield alerts using historical trends.
