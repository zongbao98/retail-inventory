import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";
import { Icon } from "./Icon";
import { NavLinks } from "./NavLinks";
import { ThemeToggle } from "./ThemeToggle";

// Self-hosted at build time by next/font: no request to Google from the browser.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-bricolage" });
const text = Figtree({ subsets: ["latin"], variable: "--f-figtree" });

export const metadata: Metadata = {
  title: "Retail Inventory",
  description: "Stock levels, reorder alerts and stock-takes for a small shop",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the script below sets data-theme before React hydrates
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        {/* apply the saved theme before first paint, so dark mode doesn't flash light */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}` }} />
      </head>
      <body>
        <nav className="top" aria-label="Main">
          <div className="top__in">
            <Link href="/" className="brand"><Icon name="store" />Retail Inventory</Link>
            <NavLinks />
            <ThemeToggle />
          </div>
        </nav>
        <main>
          {/* pages read live stock at request time; the nav shell renders statically */}
          <Suspense fallback={<p className="lead">Loading…</p>}>{children}</Suspense>
        </main>
      </body>
    </html>
  );
}
