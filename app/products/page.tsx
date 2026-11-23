import Link from "next/link";
import { db } from "@/lib/db";
import { money, type ProductStock } from "@/lib/inventory";
import { ActionForm } from "../ActionForm";
import { saveProduct } from "../actions";

export default async function Products({ searchParams }: PageProps<"/products">) {
  const { edit } = await searchParams;
  const { data, error } = await (await db()).from("product_stock").select("*").order("sku");
  if (error) throw new Error(error.message);
  const rows = data as ProductStock[];
  const p = rows.find((r) => String(r.id) === edit);

  return (
    <>
      <h1>Products</h1>
      <h2>{p ? `Edit ${p.sku}` : "Add product"}</h2>
      <ActionForm action={saveProduct} submit={p ? "Save changes" : "Add product"} resetOnSuccess={!p}>
        {p && <input type="hidden" name="id" value={p.id} />}
        <label>SKU<input name="sku" required defaultValue={p?.sku} /></label>
        <label>Name<input name="name" required defaultValue={p?.name} /></label>
        <label>Cost<input name="cost" type="number" step="0.01" min="0" required defaultValue={p?.cost} /></label>
        <label>Selling price<input name="price" type="number" step="0.01" min="0" required defaultValue={p?.price} /></label>
        <label>Reorder level<input name="reorder_level" type="number" min="0" step="1" required defaultValue={p?.reorder_level ?? 0} /></label>
        {!p && <label>Opening stock<input name="opening_stock" type="number" min="0" step="1" /></label>}
        {p && <Link href="/products">Cancel</Link>}
      </ActionForm>

      <table>
        <thead>
          <tr><th>SKU</th><th>Name</th><th className="num">Cost</th><th className="num">Price</th><th className="num">Margin</th><th className="num">Stock</th><th className="num">Reorder level</th><th /></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.sku}</td><td>{r.name}</td>
              <td className="num">{money(Number(r.cost))}</td><td className="num">{money(Number(r.price))}</td>
              <td className="num">{money(Number(r.price) - Number(r.cost))}</td>
              <td className="num">{r.stock}</td><td className="num">{r.reorder_level}</td>
              <td><Link href={`/products?edit=${r.id}`}>Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
