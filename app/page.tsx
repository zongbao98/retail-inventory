import { db } from "@/lib/db";
import { isLow, money, suggestOrder, type ProductStock } from "@/lib/inventory";

export default async function Dashboard() {
  const { data, error } = await (await db()).from("product_stock").select("*").order("sku");
  if (error) throw new Error(error.message);
  const rows = (data as ProductStock[]).sort((a, b) => Number(isLow(b)) - Number(isLow(a)));
  const low = rows.filter(isLow);

  return (
    <>
      <h1>Dashboard</h1>
      <p>
        {low.length ? <><span className="badge">{low.length}</span> item(s) below reorder level</> : "All items above reorder level."}
        {" "}Suggested order = last 30 days&apos; sales + reorder level − current stock.
      </p>
      <table>
        <thead>
          <tr>
            <th>SKU</th><th>Name</th><th className="num">Stock</th><th className="num">Reorder level</th>
            <th className="num">Sold (30d)</th><th className="num">Suggested order</th><th className="num">Order cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const s = isLow(p) ? suggestOrder(p) : 0;
            return (
              <tr key={p.id} className={isLow(p) ? "low" : ""}>
                <td>{p.sku}</td><td>{p.name}</td>
                <td className="num">{p.stock}</td><td className="num">{p.reorder_level}</td>
                <td className="num">{p.sales_30d}</td>
                <td className="num">{s || "—"}</td>
                <td className="num">{s ? money(s * Number(p.cost)) : "—"}</td>
              </tr>
            );
          })}
          {!rows.length && <tr><td colSpan={7}>No products yet — add some on the Products page.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
