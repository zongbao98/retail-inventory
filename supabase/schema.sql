-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists products (
  id bigint generated always as identity primary key,
  sku text not null unique,
  name text not null,
  cost numeric(12,2) not null check (cost >= 0),
  price numeric(12,2) not null check (price >= 0),
  reorder_level integer not null default 0 check (reorder_level >= 0),
  created_at timestamptz not null default now()
);

-- Stock is never stored: it is the sum of movements, so it cannot drift from history.
create table if not exists movements (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete restrict,
  type text not null check (type in ('purchase', 'sale', 'adjustment')),
  qty integer not null check (qty <> 0),  -- signed: purchase > 0, sale < 0, adjustment either way
  note text,
  created_at timestamptz not null default now(),
  check ((type = 'purchase' and qty > 0) or (type = 'sale' and qty < 0) or type = 'adjustment')
);
create index if not exists movements_product_created on movements (product_id, created_at);

-- security_invoker: the view obeys the caller's RLS instead of running as its owner.
create or replace view product_stock with (security_invoker = true) as
select p.*,
  coalesce(sum(m.qty), 0)::int as stock,
  coalesce(-sum(m.qty) filter (where m.type = 'sale' and m.created_at >= now() - interval '30 days'), 0)::int as sales_30d
from products p
left join movements m on m.product_id = p.id
group by p.id;

-- The app talks to Supabase only from the server with the secret key.
-- RLS on with no policies = the public anon key can read/write nothing.
alter table products enable row level security;
alter table movements enable row level security;
