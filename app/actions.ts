"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { parseQty, variance, type ProductStock } from "@/lib/inventory";

export type ActionState = { ok?: string; error?: string };

// shortcut: no login — anyone who can reach the app can write. Add Supabase Auth before exposing it publicly.
async function run(fn: () => Promise<string>): Promise<ActionState> {
  try {
    const ok = await fn();
    revalidatePath("/", "layout");
    return { ok };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

// Supabase returns data=null only alongside an error (or for inserts without .select(), whose result we ignore).
function check<T>(res: { data: T; error: { message: string; code?: string } | null }): NonNullable<T> {
  if (res.error) throw new Error(res.error.code === "23505" ? "That SKU already exists" : res.error.message);
  return res.data as NonNullable<T>;
}

function price(raw: FormDataEntryValue | null, label: string): number {
  const n = Number(String(raw ?? "").trim());
  if (String(raw ?? "").trim() === "" || !Number.isFinite(n) || n < 0) throw new Error(`${label} must be a number ≥ 0`);
  return Math.round(n * 100) / 100;
}

export async function saveProduct(_: ActionState, f: FormData): Promise<ActionState> {
  return run(async () => {
    const sku = String(f.get("sku") ?? "").trim();
    const name = String(f.get("name") ?? "").trim();
    if (!sku || !name) throw new Error("SKU and name are required");
    const row = {
      sku,
      name,
      cost: price(f.get("cost"), "Cost"),
      price: price(f.get("price"), "Selling price"),
      reorder_level: parseQty(f.get("reorder_level"), "Reorder level") ?? 0,
    };
    const id = parseQty(f.get("id"), "id", 1);
    if (id) {
      check(await (await db()).from("products").update(row).eq("id", id));
      return `Updated ${sku}`;
    }
    const created = check(await (await db()).from("products").insert(row).select("id").single());
    const opening = parseQty(f.get("opening_stock"), "Opening stock");
    if (opening) {
      check(await (await db()).from("movements").insert({ product_id: created.id, type: "adjustment", qty: opening, note: "opening stock" }));
    }
    return `Added ${sku}`;
  });
}

export async function logMovement(_: ActionState, f: FormData): Promise<ActionState> {
  return run(async () => {
    const product_id = parseQty(f.get("product_id"), "Product", 1);
    const type = String(f.get("type"));
    if (!product_id) throw new Error("Pick a product");
    if (!["purchase", "sale", "adjustment"].includes(type)) throw new Error("Invalid movement type");

    const raw = String(f.get("qty") ?? "").trim();
    const n = Number(raw);
    if (!raw || !Number.isInteger(n) || n === 0) throw new Error("Quantity must be a non-zero whole number");
    if (type !== "adjustment" && n < 0) throw new Error("Enter purchases and sales as positive numbers");
    const qty = type === "sale" ? -n : n;

    const p = check(await (await db()).from("product_stock").select("sku,stock").eq("id", product_id).single());
    // shortcut: read-then-insert can race with a concurrent sale; move into a Postgres function if multiple tills write at once.
    if (p.stock + qty < 0) throw new Error(`Only ${p.stock} of ${p.sku} in stock`);

    const note = String(f.get("note") ?? "").trim() || null;
    check(await (await db()).from("movements").insert({ product_id, type, qty, note }));
    return `Logged ${type} of ${Math.abs(qty)} × ${p.sku}`;
  });
}

export async function postStocktake(_: ActionState, f: FormData): Promise<ActionState> {
  return run(async () => {
    // Recompute against current stock on the server; the page's numbers may be stale.
    const products = check(await (await db()).from("product_stock").select("id,sku,stock")) as Pick<ProductStock, "id" | "sku" | "stock">[];
    const rows = [];
    for (const p of products) {
      const counted = parseQty(f.get(`count_${p.id}`), `Count for ${p.sku}`);
      if (counted === null) continue; // left blank = not counted
      const v = variance(counted, p.stock);
      if (v !== 0) rows.push({ product_id: p.id, type: "adjustment", qty: v, note: `stock-take: counted ${counted}, system ${p.stock}` });
    }
    if (rows.length) check(await (await db()).from("movements").insert(rows)); // one statement = all or nothing
    return rows.length ? `Posted ${rows.length} adjustment(s)` : "No variances to post";
  });
}
