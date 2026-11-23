"use client";

import { useState } from "react";
import { money, variance, type ProductStock } from "@/lib/inventory";
import { ActionForm } from "../ActionForm";
import { postStocktake } from "../actions";

type P = Pick<ProductStock, "id" | "sku" | "name" | "cost" | "stock">;

export function StocktakeForm({ products }: { products: P[] }) {
  return (
    <ActionForm action={postStocktake} submit="Post adjustments" className="">
      <CountTable products={products} />
    </ActionForm>
  );
}

// Lives inside the form so its counts reset when the form remounts after a successful post.
function CountTable({ products }: { products: P[] }) {
  const [counts, setCounts] = useState<Record<number, string>>({});
  const v = (p: P) => (counts[p.id]?.trim() && Number.isInteger(Number(counts[p.id])) ? variance(Number(counts[p.id]), p.stock) : null);
  const totalUnits = products.reduce((s, p) => s + (v(p) ?? 0), 0);
  const totalValue = products.reduce((s, p) => s + (v(p) ?? 0) * Number(p.cost), 0);
  const cls = (n: number) => (n > 0 ? "pos" : n < 0 ? "neg" : "");

  return (
      <table>
        <thead>
          <tr><th>SKU</th><th>Name</th><th className="num">System qty</th><th className="num">Counted</th><th className="num">Variance</th><th className="num">Variance value</th></tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const d = v(p);
            return (
              <tr key={p.id}>
                <td>{p.sku}</td><td>{p.name}</td><td className="num">{p.stock}</td>
                <td className="num">
                  <input className="count" name={`count_${p.id}`} type="number" min="0" step="1" aria-label={`Counted ${p.sku}`}
                    value={counts[p.id] ?? ""} onChange={(e) => setCounts({ ...counts, [p.id]: e.target.value })} />
                </td>
                <td className={`num ${cls(d ?? 0)}`}>{d === null ? "" : d > 0 ? `+${d}` : d}</td>
                <td className={`num ${cls(d ?? 0)}`}>{d === null ? "" : money(d * Number(p.cost))}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr><th colSpan={4}>Total</th><th className={`num ${cls(totalUnits)}`}>{totalUnits}</th><th className={`num ${cls(totalValue)}`}>{money(totalValue)}</th></tr>
        </tfoot>
      </table>
  );
}
