import { db } from "@/lib/db";
import type { ProductStock } from "@/lib/inventory";
import { StocktakeForm } from "./StocktakeForm";

export default async function Stocktake() {
  const { data, error } = await (await db()).from("product_stock").select("id,sku,name,cost,stock").order("sku");
  if (error) throw new Error(error.message);
  return (
    <>
      <h1>Stock-take</h1>
      <p className="lead">Type what you counted on the shelf. Leave an item blank to skip it. When you post, each difference is saved as an adjustment and stock matches your count.</p>
      <StocktakeForm products={data as Pick<ProductStock, "id" | "sku" | "name" | "cost" | "stock">[]} />
    </>
  );
}
