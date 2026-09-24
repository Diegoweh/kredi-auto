"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/lib/site";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { SocialLinks } from "./social-links";
import { Logo } from "./logo";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20">
        <Logo className="h-6 w-auto sm:h-7" />

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="relative py-2 text-[15px] font-medium text-muted transition-colors hover:text-ink aria-[current=page]:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:brand-rule after:transition-transform aria-[current=page]:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <SocialLinks className="hidden sm:flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="-mr-2 grid size-11 place-items-center rounded-full text-ink md:hidden"
          >
            {open ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 bottom-0 z-40 bg-white md:hidden">
          <nav aria-label="Menú móvil" className="flex h-full flex-col px-4 pt-6 pb-10">
            <ul className="divide-y divide-line border-y border-line">
              {[{ href: "/", label: "Inicio" }, ...nav].map((item, i) => (
                <li key={item.href} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-center justify-between py-5 text-2xl font-semibold tracking-tight aria-[current=page]:text-brand-600"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <p className="mb-2 text-sm text-muted">Síguenos</p>
              <SocialLinks className="-ml-2" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
