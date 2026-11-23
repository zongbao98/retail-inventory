"use client";

import { useSyncExternalStore } from "react";
import { dailySales, niceMax, type Sale } from "@/lib/inventory";

const noop = () => () => {};

export function SalesChart({ sales }: { sales: Sale[] }) {
  // Days are bucketed in the viewer's time zone, so render only in the browser (server runs in UTC).
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const buckets = isClient ? dailySales(sales) : [];
  const top = niceMax(Math.max(0, ...buckets.map((b) => b.units)));
  const ticks = top % 2 ? [top, 0] : [top, top / 2, 0]; // units are whole, so no 0.5 tick
  const total = buckets.reduce((s, b) => s + b.units, 0);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "short" });

  return (
    <figure className="chart">
      <figcaption className="chart__head">
        <h2>Units sold per day</h2>
        <span className="legend">Last 30 days · {isClient ? total : "…"} units</span>
      </figcaption>
      <div className="cols" role="list" aria-label="Units sold per day, last 30 days">
        <div className="cols__grid" aria-hidden="true">
          {ticks.map((t) => <span key={t} style={{ bottom: `${(t / top) * 100}%` }}><em>{t}</em></span>)}
        </div>
        <div className="cols__plot">
          {buckets.map((b, i) => (
            <div key={i} className="col" role="listitem" tabIndex={0} aria-label={`${fmt(b.date)}: ${b.units} units`}>
              <span className="col__bar" style={{ height: `${(b.units / top) * 100}%` }} />
              <span className="tip"><strong>{b.units}</strong> units · {fmt(b.date)}</span>
            </div>
          ))}
        </div>
        <div className="cols__x" aria-hidden="true">
          {buckets.map((b, i) => <span key={i}>{i % 7 === 2 ? fmt(b.date) : ""}</span>)}
        </div>
      </div>
      <details className="chart__table">
        <summary>Show as table</summary>
        <table>
          <thead><tr><th>Day</th><th className="num">Units sold</th></tr></thead>
          <tbody>
            {buckets.filter((b) => b.units).map((b, i) => (
              <tr key={i}><td>{fmt(b.date)}</td><td className="num">{b.units}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
