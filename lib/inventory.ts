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
