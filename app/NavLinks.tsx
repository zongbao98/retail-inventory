"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const links = [
  { href: "/", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/products", label: "Products", icon: "package" },
  { href: "/movements", label: "Movements", icon: "arrow-left-right" },
  { href: "/stocktake", label: "Stock-take", icon: "clipboard-check" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <div className="links">
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          <Icon name={l.icon} />
          {l.label}
        </Link>
      ))}
    </div>
  );
}
