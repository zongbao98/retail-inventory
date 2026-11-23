import { isLow, type ProductStock } from "@/lib/inventory";
import { Icon } from "./Icon";

/** Horizontal bars: stock per product, a tick at its reorder level. Low items in the status red. */
export function StockChart({ rows }: { rows: ProductStock[] }) {
  const max = Math.max(1, ...rows.map((p) => Math.max(p.stock, p.reorder_level)));
  const pct = (n: number) => `${(Math.max(0, n) / max) * 100}%`;

  return (
    <figure className="chart">
      <figcaption className="chart__head">
        <h2>Stock vs reorder level</h2>
        <span className="legend"><span className="key key--tick" />Reorder level</span>
      </figcaption>
      <ul className="hbars">
        {rows.map((p) => (
          <li key={p.id} className={`hbar ${isLow(p) ? "hbar--low" : ""}`} tabIndex={0}
            aria-label={`${p.sku}: stock ${p.stock}, reorder level ${p.reorder_level}${isLow(p) ? ", reorder" : ""}`}>
            <span className="hbar__label">{p.sku}</span>
            <span className="hbar__track">
              <span className="hbar__bar" style={{ width: pct(p.stock) }} />
              <span className="hbar__tick" style={{ left: pct(p.reorder_level) }} />
            </span>
            <span className="hbar__value">
              {isLow(p) && <Icon name="triangle-alert" />}{p.stock}
            </span>
            <span className="tip" role="presentation">
              <strong>{p.stock}</strong> in stock · reorder at {p.reorder_level}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
