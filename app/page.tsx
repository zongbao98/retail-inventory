import { db } from "@/lib/db";
import { isLow, money, suggestOrder, type ProductStock } from "@/lib/inventory";
import { Icon } from "./Icon";
import { SalesChart } from "./SalesChart";
import { StockChart } from "./StockChart";

// Runs per request (db() awaits connection()), so reading the clock here is intended.
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();

export default async function Dashboard() {
  const sb = await db();
  const since = daysAgo(31); // a day extra: the chart buckets by the viewer's local days
  const [{ data, error }, sales] = await Promise.all([
    sb.from("product_stock").select("*").order("sku"),
    sb.from("movements").select("qty,created_at").eq("type", "sale").gte("created_at", since),
  ]);
  if (error) throw new Error(error.message);
  if (sales.error) throw new Error(sales.error.message);
  const rows = (data as ProductStock[]).sort((a, b) => Number(isLow(b)) - Number(isLow(a)));
  const low = rows.filter(isLow);
  const stockValue = rows.reduce((s, p) => s + p.stock * Number(p.cost), 0);
  const orderCost = low.reduce((s, p) => s + suggestOrder(p) * Number(p.cost), 0);

  return (
    <>
      {/* the nav already says Dashboard; the heading stays for screen readers */}
      <h1 className="sr-only">Dashboard</h1>

      <div className="stats">
        <div className={`stat ${low.length ? "stat--alert" : ""}`}>
          <div className="stat__label"><Icon name="triangle-alert" />Items to reorder</div>
          <div className="stat__value">{low.length}</div>
        </div>
        <div className="stat">
          <div className="stat__label"><Icon name="truck" />Suggested order cost</div>
          <div className="stat__value">{money(orderCost)}</div>
        </div>
        <div className="stat">
          <div className="stat__label"><Icon name="package" />Stock value at cost</div>
          <div className="stat__value">{money(stockValue)}</div>
        </div>
      </div>

      <div className="charts">
        <StockChart rows={rows} />
        <SalesChart sales={sales.data} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Name</th><th>Status</th><th className="num">Stock</th><th className="num">Reorder level</th>
              <th className="num">Sold (30 days)</th><th className="num">Suggested order</th><th className="num">Order cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const s = isLow(p) ? suggestOrder(p) : 0;
              return (
                <tr key={p.id} className={isLow(p) ? "low" : ""}>
                  <td>{p.sku}</td><td className="name">{p.name}</td>
                  <td>
                    {isLow(p)
                      ? <span className="tag tag--low"><Icon name="triangle-alert" />Reorder</span>
                      : <span className="tag pos"><Icon name="circle-check" />OK</span>}
                  </td>
                  <td className="num">{p.stock}</td><td className="num">{p.reorder_level}</td>
                  <td className="num">{p.sales_30d}</td>
                  <td className="num">{s || "—"}</td>
                  <td className="num">{s ? money(s * Number(p.cost)) : "—"}</td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={8}>No products yet. Add them on the Products page.</td></tr>}
          </tbody>
        </table>
      </div>

      <p className="note">
        Red rows are running low. For each one you get an order quantity that covers the next 30 days at last month&apos;s sales,
        plus the reorder level as a buffer.
      </p>
    </>
  );
}
