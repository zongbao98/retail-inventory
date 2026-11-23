export type ProductStock = {
  id: number;
  sku: string;
  name: string;
  cost: number;
  price: number;
  reorder_level: number;
  stock: number;
  sales_30d: number;
};

/** Cover the next 30 days at last month's sales pace and still end at the reorder level. */
export function suggestOrder(p: Pick<ProductStock, "stock" | "reorder_level" | "sales_30d">): number {
  return Math.max(0, p.sales_30d + p.reorder_level - p.stock);
}

export function isLow(p: Pick<ProductStock, "stock" | "reorder_level">): boolean {
  return p.stock < p.reorder_level;
}

/** Positive = more on the shelf than the system thinks. */
export function variance(counted: number, system: number): number {
  return counted - system;
}

/** Parses a whole-number form field. Returns null when blank, throws when invalid. */
export function parseQty(raw: FormDataEntryValue | null, label: string, min = 0): number | null {
  const s = String(raw ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  if (!Number.isInteger(n) || n < min) throw new Error(`${label} must be a whole number ≥ ${min}`);
  return n;
}

export const money = (n: number) => n.toFixed(2);

export type Sale = { qty: number; created_at: string };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Bucket sales into the viewer's local days, oldest first, including days with no sales. */
export function dailySales(sales: Sale[], now = new Date(), days = 30) {
  const out = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - i));
    return { date: d, units: 0 };
  });
  const index = new Map(out.map((b, i) => [dayKey(b.date), i]));
  for (const s of sales) {
    const i = index.get(dayKey(new Date(s.created_at)));
    if (i !== undefined) out[i].units += Math.abs(s.qty);
  }
  return out;
}

/** A clean axis top: 1, 2 or 5 × a power of ten, at or above max. */
export function niceMax(max: number) {
  if (max <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(max));
  return ([1, 2, 5, 10].find((m) => m * p >= max) ?? 10) * p;
}
