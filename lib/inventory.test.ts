import { test } from "node:test";
import assert from "node:assert/strict";
import { isLow, parseQty, suggestOrder, variance } from "./inventory.ts";

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
