import { db } from "@/lib/db";
import { ActionForm } from "../ActionForm";
import { logMovement } from "../actions";

type Row = { id: number; type: string; qty: number; note: string | null; created_at: string; products: { sku: string; name: string } };

export default async function Movements() {
  const [products, recent] = await Promise.all([
    (await db()).from("products").select("id,sku,name").order("sku"),
    (await db()).from("movements").select("id,type,qty,note,created_at,products(sku,name)").order("created_at", { ascending: false }).limit(50),
  ]);
  if (products.error) throw new Error(products.error.message);
  if (recent.error) throw new Error(recent.error.message);

  return (
    <>
      <h1>Stock movements</h1>
      <ActionForm action={logMovement} submit="Log movement">
        <label>Product
          <select name="product_id" required defaultValue="">
            <option value="" disabled>Choose…</option>
            {products.data.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
          </select>
        </label>
        <label>Type
          <select name="type" defaultValue="sale">
            <option value="purchase">Purchase (+)</option>
            <option value="sale">Sale (−)</option>
            <option value="adjustment">Adjustment (±)</option>
          </select>
        </label>
        <label>Quantity<input name="qty" type="number" step="1" required title="Adjustments may be negative" /></label>
        <label>Note<input name="note" /></label>
      </ActionForm>

      <h2>Last 50 movements</h2>
      <table>
        <thead><tr><th>When</th><th>SKU</th><th>Type</th><th className="num">Qty</th><th>Note</th></tr></thead>
        <tbody>
          {(recent.data as unknown as Row[]).map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td>{m.products.sku}</td><td>{m.type}</td>
              <td className={`num ${m.qty > 0 ? "pos" : "neg"}`}>{m.qty > 0 ? `+${m.qty}` : m.qty}</td>
              <td>{m.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
