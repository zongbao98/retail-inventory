import { db } from "@/lib/db";
import type { ProductStock } from "@/lib/inventory";
import { StocktakeForm } from "./StocktakeForm";

export default async function Stocktake() {
  const { data, error } = await (await db()).from("product_stock").select("id,sku,name,cost,stock").order("sku");
  if (error) throw new Error(error.message);
  return (
    <>
      <h1>Stock-take</h1>
      <p>Enter the counted quantity for each item. Leave blank to skip. Posting writes one adjustment per non-zero variance.</p>
      <StocktakeForm products={data as Pick<ProductStock, "id" | "sku" | "name" | "cost" | "stock">[]} />
    </>
  );
}
