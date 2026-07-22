# DairyFlow

A frontend-only prototype of a business management platform for dairy farms — built for **Bhati Dairy Farm** (Jodhpur, Rajasthan). React, TypeScript, Vite, Tailwind CSS, Radix-based UI components, and Recharts. No backend: all data is mocked and interactions update in-memory state. See `PRODUCT_NOTES.md` for the full product rationale (target users, problems, principles, and scope).

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

## Screens & features

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

- KPI tiles: total cattle, lactating cattle, milk produced today, average yield/animal, low-stock items, active sales leads.
- 7-day milk production trend chart.
- Herd overview by status (lactating / dry / pregnant / calves / under treatment).
- "Needs Attention" alerts feed and a recent-activity timeline.
- One-click quick actions (record milk, add cattle, update inventory, add lead).
- **Farm Assistant** panel (right side): a chat box with text and voice (mic) input that answers natural-language questions about the farm — herd status, today's production, low-stock items, lead pipeline, open tasks, active alerts — computed live from the app's mock data. Voice input uses the browser's built-in Speech Recognition API; the mic button disables itself gracefully in browsers that don't support it.

### Farm Records
![Farm Records](docs/screenshots/farm-records.png)

- Searchable, filterable (breed / health status / lactation status), sortable, paginated cattle table.
- **Add Animal** dialog to create a new record.
- **Edit** action on every row (and inside the details view) to update any field — including health status, lactation status, and yield — with changes reflected immediately and confirmed by a toast.
- **View** action opens a details dialog with tabs for Overview, Health history, Breeding info, and a recent-yield chart.

### Milk Production
![Milk Production](docs/screenshots/milk-production.png)

- Morning / evening / total production, average yield, and rejected-milk summary tiles.
- 7-day production trend chart.
- Production log table with fat %, SNF %, and quality status per herd group.
- **Record Production** dialog with auto-computed quality status.

### Inventory
![Inventory](docs/screenshots/inventory.png)

- Low-stock alert banner and stock-status summary tiles.
- Searchable, filterable inventory table (category, stock status) covering feed, supplements, medicines, vaccines, cleaning supplies, and equipment.
- **Add Item** and **Update Stock** dialogs with automatic status recalculation (In Stock / Low Stock / Out of Stock / Expiring Soon).

### Leads (CRM)
![Leads](docs/screenshots/leads.png)

- Kanban pipeline across 7 stages (New Inquiry → Contacted → Visit Scheduled → Proposal Sent → Negotiation → Won / Lost).
- Move a lead by drag-and-drop **or** via a reliable "Move to..." dropdown on every card.
- Table view toggle with search and stage filter.
- **Add Lead** dialog; pipeline value and follow-up-due stats update live.

### Tasks
![Tasks](docs/screenshots/tasks.png)

- Filterable list of vet visits, vaccinations, breeding follow-ups, inventory purchases, buyer follow-ups, and equipment maintenance.
- Overdue items flagged in red; one-click complete/reopen toggle.
- **Add Task** dialog.

### Reports
![Reports](docs/screenshots/reports.png)

- Farm-wide KPIs: weekly milk total, average yield, herd productivity, lead conversion rate, expected monthly pipeline value, inventory items needing attention.
- Charts: milk production trend, herd productivity by breed, inventory stock health, sales lead conversion by stage, and expected value by buyer type.

## Design decisions

- Deep green as the primary brand accent on white/neutral surfaces; amber and red are reserved for genuine warning states.
- A small shared UI kit (button, card, badge, dialog, select, tabs, dropdown, toast, etc.) is used consistently across every screen.
- The global "Add Record" menu in the header deep-links into each page's own add dialog (`?new=1`), so quick actions always land in the right place.

## Known scope cuts

- No persistence — refreshing the page resets in-memory edits (see `PRODUCT_NOTES.md` for the reasoning).
- The Reports period selector is decorative (always shows "This Week" data).
- The Farm Assistant answers from the app's local mock data with simple keyword matching — it is not connected to a hosted LLM (this is a frontend-only, no-backend prototype).
