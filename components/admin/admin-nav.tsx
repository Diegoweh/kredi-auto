"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/autos", label: "Autos" },
  { href: "/admin/solicitudes", label: "Solicitudes de venta" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="order-last flex w-full gap-6 text-sm font-semibold sm:order-none sm:w-auto">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname.startsWith(item.href) ? "page" : undefined}
          className="border-b-2 border-transparent py-2 text-muted hover:text-ink aria-[current=page]:border-brand aria-[current=page]:text-ink"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
