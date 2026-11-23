import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";

export const metadata: Metadata = {
  title: "Retail Inventory",
  description: "Stock, reorder alerts and stock-take",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the script below sets data-theme before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* apply the saved theme before first paint, so dark mode doesn't flash light */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body>
        <nav>
          <strong>Retail Inventory</strong>
          <Link href="/">Dashboard</Link>
          <Link href="/products">Products</Link>
          <Link href="/movements">Movements</Link>
          <Link href="/stocktake">Stock-take</Link>
          <ThemeToggle />
        </nav>
        <main>
          {/* pages read live stock at request time; the nav shell renders statically */}
          <Suspense fallback={<p>Loading…</p>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
