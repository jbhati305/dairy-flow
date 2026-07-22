# DairyFlow — Demo Script (3–5 minutes)

A presentation flow for demonstrating DairyFlow as one coherent, connected product rather than seven disconnected admin screens.

## 1. Introduce the user and problem (30s)

> "This is DairyFlow, built for Jitesh Bhati, who runs Bhati Dairy Farm in Jodhpur, Rajasthan. He's not a data analyst — he's the owner, the farm manager, and the person a vet calls when an animal is sick, all at once. Most farm software treats herd health, milk production, inventory, and sales as separate apps. DairyFlow treats them as one business, because a sick animal, a feed shortage, and an oversold contract are all the same kind of problem: something that needs attention *today*."

Land on the **Dashboard**.

## 2. Show Today's Priorities (45s)

> "Instead of a wall of charts, the Dashboard opens with 'Today's Priorities' — a curated, actionable list, not a passive report."

- Point out a **milk-yield decline** card → click **View animal** to show it jumps straight to that animal's record.
- Point out a **vaccination-due** card and its four actions: View, Mark completed, Create task, Snooze.
- Note the KPI row above it — Total Cattle, Lactating, Milk Today, Avg Yield, Low Stock, Active Leads — "these are the headline numbers; everything below is what to *do* about them."

## 3. Resolve an inventory warning (45s)

Navigate to **Inventory**.

> "Green Fodder is low on stock *and* expiring soon — both risks shown at once, not hidden behind each other."

- Click **View** on Green Fodder → show the transaction history (real Stock In / Consumed entries, not a single balance number).
- Click **Adjust Stock** → choose **Stock In**, enter a quantity, **Save Transaction**.
- Point out: the item's status recalculates instantly, the "items need attention" banner count drops, and — flip back to **Dashboard** — the Low-Stock KPI updates too.

## 4. Record an animal health event (45s)

Navigate to **Herd & Health**, open an animal with a vaccination due (e.g. DF-104).

> "Every animal has one-tap quick actions: log a health event, record a vaccination, add a breeding event, record yield, or create a vet task."

- Click **Record Vaccination**, fill in the vaccine name, **Save Vaccination**.
- Point out: the dialog updates live (last vaccination, next check-up), and the corresponding Dashboard alert is now gone — because alerts are computed from live data, not a separate stale list.

## 5. Add or progress a buyer lead (45s)

Navigate to **Leads**.

> "This isn't a generic CRM — it's built around what a dairy buyer actually needs: litres per day, price per litre, delivery timing, trial order status."

- Click **Add Lead**, fill in business name, contact, litres/day, price/litre — note the estimated monthly value calculates itself.
- Move the new lead a stage forward via the card's **Move to...** menu, or drag it.
- Point out the **capacity warning banner**: "Advanced-stage demand exceeds estimated surplus" — leads close to closing want more milk per day than the farm can currently supply.

## 6. Explain demand versus production capacity (30s)

Stay on **Leads**, point at the stat row.

> "'Available Surplus' and 'Demand vs Capacity' come from the same calculation as the Dashboard's 'Available to Sell' card: today's actual production, minus an estimated processing reserve, minus litres already committed to signed buyers. If that surplus can't cover what's in late-stage negotiation, the farm sees it *before* over-promising a new contract — not after."

## 7. Show updated reports (30s)

Navigate to **Reports**.

> "Every number here is the same shared calculation used everywhere else, just aggregated over a longer window."

- Switch the period selector between **Last 7 Days**, **30**, and **90 Days** — show the milk trend chart, herd productivity, and lead conversion all update together.
- Read one or two of the auto-generated **Insights** aloud (e.g. "Milk production increased X% compared with the previous period").

## 8. Demonstrate persistence and Reset Demo Data (30s)

> "None of this needs a backend to feel real."

- Refresh the browser — show the lead you added, the inventory transaction, and the vaccination are all still there.
- Open the user menu (top right) → **Reset Demo Data** → confirm.
- Show everything reverts to the original demo dataset — "useful for running this demo again, or handing it to someone else to try."

---

**Closing line:** "The point isn't seven screens — it's one farm, one set of numbers, and a manager who can act on them in one tap."
