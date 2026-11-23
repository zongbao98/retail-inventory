# Retail Inventory with Reorder Alerts

Next.js (TypeScript) + Supabase. Record products, log purchases / sales / adjustments, see what to reorder, and run stock-takes.

## Setup

1. Create a Supabase project. In **SQL Editor**, run [`supabase/schema.sql`](supabase/schema.sql).
2. Copy `.env.example` to `.env.local` and fill in `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (Project Settings → API).
3. `npm install`, then `npm run dev` and open http://localhost:3000.

## How it works

- **Stock is never stored** — it's the sum of a product's movements (`product_stock` view). Opening stock is an adjustment.
- **Dashboard** shows items below reorder level first, in red, with
  `suggested order = sales in last 30 days + reorder level − current stock` (never below 0).
- **Stock-take**: enter counted quantities; variance (counted − system) and its value at cost update live. Posting writes one adjustment per non-zero variance, recomputed against current stock on the server.
- All database access is server-side with the secret key. RLS is on with no policies, so the public anon key can't touch the data.

## Tests

`npm test` — reorder suggestion, low-stock and variance logic.

## Not included

No login (anyone who can reach the app can edit — add Supabase Auth before exposing it publicly), single store, no suppliers / purchase orders.
