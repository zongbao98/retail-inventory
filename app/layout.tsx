import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail Inventory",
  description: "Stock, reorder alerts and stock-take",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <nav>
          <strong>Retail Inventory</strong>
          <Link href="/">Dashboard</Link>
          <Link href="/products">Products</Link>
          <Link href="/movements">Movements</Link>
          <Link href="/stocktake">Stock-take</Link>
        </nav>
        <main>
          {/* pages read live stock at request time; the nav shell renders statically */}
          <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
