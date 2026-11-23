import { test } from "node:test";
import assert from "node:assert/strict";
import { dailySales, isLow, niceMax, parseQty, suggestOrder, variance } from "./inventory.ts";

test("dailySales buckets by local day, keeps empty days, ignores older sales", () => {
  const now = new Date(2026, 10, 24, 15, 0);
  const at = (day: number, h: number, month = 10) => new Date(2026, month, day, h).toISOString();
  const b = dailySales(
    [{ qty: -3, created_at: at(24, 9) }, { qty: -2, created_at: at(24, 23) }, { qty: -5, created_at: at(20, 1) }, { qty: -9, created_at: at(20, 12, 9) }],
    now,
  );
  assert.equal(b.length, 30);
  assert.equal(b[29].date.getDate(), 24);
  assert.equal(b[29].units, 5); // 9am + 11pm on the same local day
  assert.equal(b[25].units, 5);
  assert.equal(b.reduce((s, x) => s + x.units, 0), 10); // Oct 20 is outside the 30 days (Oct 26 – Nov 24)
});

test("niceMax rounds up to 1, 2, 5 × 10^n", () => {
  assert.deepEqual([0, 1, 3, 7, 12, 40, 51].map(niceMax), [1, 1, 5, 10, 20, 50, 100]);
});

test("suggestOrder covers 30 days of sales and refills to reorder level", () => {
  assert.equal(suggestOrder({ stock: 4, reorder_level: 10, sales_30d: 30 }), 36);
  assert.equal(suggestOrder({ stock: 2, reorder_level: 5, sales_30d: 0 }), 3); // no sales: top up only
  assert.equal(suggestOrder({ stock: 50, reorder_level: 5, sales_30d: 10 }), 0); // never negative
});

test("isLow is strictly below reorder level", () => {
  assert.equal(isLow({ stock: 9, reorder_level: 10 }), true);
  assert.equal(isLow({ stock: 10, reorder_level: 10 }), false);
});

test("variance is counted minus system", () => {
  assert.equal(variance(8, 10), -2);
  assert.equal(variance(12, 10), 2);
});

test("parseQty: blank is null, rejects fractions and negatives", () => {
  assert.equal(parseQty("", "x"), null);
  assert.equal(parseQty(" 7 ", "x"), 7);
  assert.throws(() => parseQty("1.5", "x"));
  assert.throws(() => parseQty("-1", "x"));
});
